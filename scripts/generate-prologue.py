#!/usr/bin/env python3
"""
Update src/engine/arena.ts prologue descriptions and terrain chances from action_templates.xlsx - Prologue.csv

Usage:
    python3 scripts/generate-prologue.py path/to/Prologue.csv
    
The CSV should have columns: terrain_id (or terrain), chance, text
- chance is percentage (0-100) or decimal (0-1); empty for non-rolled entries like start, end, no_terrain
Special terrains: 'start' (intro text), 'end' (outro text), 'no_terrain' (fallback when no terrain rolls)
Regular terrains: forest, river, lake, islands, mountain, desert, plains, hills
"""

import csv
import json
import sys
import re
from pathlib import Path


def parse_chance(raw: str):
    raw = (raw or '').strip().rstrip('%').strip()
    if not raw:
        return None
    val = float(raw)
    if val > 1.0:
        val = val / 100.0
    return round(val, 6)


def parse_prologue_csv(csv_path: str) -> dict:
    """Parse Prologue CSV and return terrain descriptions and chances."""
    
    terrain_texts = {}
    terrain_chances = {}
    start_text = ""
    end_text = ""
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            terrain = (row.get('terrain_id') or row.get('terrain') or '').strip()
            text = (row.get('text') or '').strip()
            chance = parse_chance(row.get('chance', ''))
            if not terrain:
                continue
            
            if terrain == 'start':
                start_text = text
            elif terrain == 'end':
                end_text = text
            else:
                if text:
                    terrain_texts[terrain] = text
                if chance is not None:
                    terrain_chances[terrain] = chance
    
    return {
        'start': start_text,
        'end': end_text,
        'terrains': terrain_texts,
        'chances': terrain_chances
    }


def update_arena_file(arena_path: Path, data: dict):
    """Update arena.ts with new terrain chances and prologue descriptions."""
    
    content = arena_path.read_text(encoding='utf-8')
    
    rolled_keys = [
        'forest', 'river', 'lake', 'islands', 'mountain', 'desert', 'plains', 'hills'
    ]
    chance_lines = []
    for key in rolled_keys:
        if key in data['chances']:
            chance_lines.append(f"  '{key}': {data['chances'][key]},")
    if chance_lines:
        chance_obj = "\n".join(chance_lines)
        chance_pattern = r"const TERRAIN_CHANCES: Partial<Record<TerrainType, number>> = \{[^}]+\};"
        chance_replacement = f"""const TERRAIN_CHANCES: Partial<Record<TerrainType, number>> = {{
{chance_obj}
}};"""
        content = re.sub(chance_pattern, chance_replacement, content, flags=re.DOTALL)
    
    # Build the terrain descriptions object
    terrain_keys = [
        'forest', 'river', 'lake', 'islands', 'mountain', 'desert', 'plains', 'hills', 'no_terrain'
    ]
    
    terrain_lines = []
    for key in terrain_keys:
        value = data['terrains'].get(key, '')
        terrain_lines.append(f"      '{key}': {json.dumps(value, ensure_ascii=False)},")
    
    terrain_obj = "\n".join(terrain_lines)
    
    pattern = r"const terrainDescriptions: Record<string, string> = \{[^}]+\};"
    replacement = f"""const terrainDescriptions: Record<string, string> = {{
{terrain_obj}
    }};"""
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Update start and end text (the lines.push right after the marker comment)
    for marker, key in (('// Start text', 'start'), ('// End text', 'end')):
        pattern = re.escape(marker) + r"(\n\s*(?:lines\.push\(''\);\n\s*)?)lines\.push\(\"(?:[^\"\\]|\\.)*\"\);"
        line = f"lines.push({json.dumps(data[key], ensure_ascii=False)});"
        content = re.sub(pattern, lambda m: marker + m.group(1) + line, content)
    
    arena_path.write_text(content, encoding='utf-8')


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/generate-prologue.py path/to/Prologue.csv")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    if not Path(csv_path).exists():
        print(f"Error: File not found: {csv_path}")
        sys.exit(1)
    
    data = parse_prologue_csv(csv_path)
    
    arena_path = Path(__file__).parent.parent / "src" / "engine" / "arena.ts"
    update_arena_file(arena_path, data)
    
    print(f"✓ Updated {arena_path}")
    print(f"  Start: {data['start'][:50]}..." if len(data['start']) > 50 else f"  Start: {data['start']}")
    print(f"  End: {data['end'][:50]}..." if len(data['end']) > 50 else f"  End: {data['end']}")
    print(f"  {len(data['terrains'])} terrain descriptions, {len(data['chances'])} chances")


if __name__ == "__main__":
    main()
