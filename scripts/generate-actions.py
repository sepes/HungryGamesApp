#!/usr/bin/env python3
"""
Generate src/engine/actions.ts from action_templates.xlsx - Actions.csv

Usage:
    python3 scripts/generate-actions.py path/to/Actions.csv
    
The CSV should have columns: id, type, phase, terrainRequired, chance multiplier, damage, weapon/tool, template, acquisitions, notes
- terrainRequired is comma-separated OR logic (arena needs at least one of the listed terrains)
- chance multiplier scales the likelihood of picking the template (default 1)
- Damage values are integers (0-100 scale)
- Acquisitions column specifies items gained (for solo/versus=killer gets it, group=all get it)
- System rows with id="cannon"/"cannon_group" and type="system" are used for cannon sound templates
- Actions with same id but different damage, chance multiplier, or acquisitions are split into separate actions
"""

import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path


def parse_actions_csv(csv_path: str) -> tuple[list[str], list[str], dict]:
    """Parse Actions CSV and return cannon templates, cannon_group templates, and grouped actions."""
    
    cannon_templates = []
    cannon_group_templates = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['type'] == 'system':
                template = row.get('template', '').strip()
                if not template:
                    continue
                if row['id'] == 'cannon':
                    cannon_templates.append(template)
                elif row['id'] == 'cannon_group':
                    cannon_group_templates.append(template)
    
    groups = defaultdict(lambda: {"templates": [], "meta": None})
    valid_types = {"solo", "versus", "group"}
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            id_ = row['id'].strip()
            typ = row['type'].strip().lower()
            
            if not id_ or typ not in valid_types:
                continue
                
            phase = row['phase'].strip().lower()
            terrain_raw = row.get('terrainRequired', '') or ''
            chance_raw = (row.get('chance multiplier') or row.get('change multiplier') or '').strip()
            dmg_raw = row.get('damage', '0') or '0'
            weapon_tool = (row.get('weapon/tool', '') or '').strip().lower()
            tmpl = (row.get('template', '') or '').strip()
            acquisitions = (row.get('acquisitions', '') or '').strip().lower()
            
            if not tmpl:
                continue
                
            try:
                dmg_int = int(float(dmg_raw))
            except Exception:
                dmg_int = 0

            try:
                chance_mult = float(chance_raw) if chance_raw else 1.0
                if chance_mult <= 0:
                    chance_mult = 1.0
            except Exception:
                chance_mult = 1.0
                
            terrains = [t.strip().lower() for t in terrain_raw.split(',') if t.strip()]
            
            key = (id_, typ, phase, tuple(terrains), dmg_int, chance_mult, weapon_tool, acquisitions)
            if groups[key]["meta"] is None:
                groups[key]["meta"] = (id_, typ, phase, terrains, dmg_int, chance_mult, weapon_tool, acquisitions)
            groups[key]["templates"].append(tmpl)
    
    return cannon_templates, cannon_group_templates, groups


def generate_typescript(cannon_templates: list[str], cannon_group_templates: list[str], groups: dict) -> str:
    """Generate TypeScript code for actions.ts"""
    
    lines = []
    lines.append("import type { Action, MajorEvent } from './types';")
    lines.append("")
    lines.append("// Generated from action_templates.xlsx - Actions.csv")
    lines.append("const CANNON_TEMPLATES = [")
    for i, template in enumerate(cannon_templates):
        comma = "," if i < len(cannon_templates) - 1 else ""
        lines.append(f"  {json.dumps(template, ensure_ascii=False)}{comma}")
    lines.append("];")
    lines.append("")
    lines.append("const CANNON_GROUP_TEMPLATES = [")
    for i, template in enumerate(cannon_group_templates):
        comma = "," if i < len(cannon_group_templates) - 1 else ""
        lines.append(f"  {json.dumps(template, ensure_ascii=False)}{comma}")
    lines.append("];")
    lines.append("")
    lines.append("function getRandomCannonTemplate(): string {")
    lines.append("  return CANNON_TEMPLATES[Math.floor(Math.random() * CANNON_TEMPLATES.length)]!;")
    lines.append("}")
    lines.append("")
    lines.append("function getRandomCannonGroupTemplate(): string {")
    lines.append("  return CANNON_GROUP_TEMPLATES[Math.floor(Math.random() * CANNON_GROUP_TEMPLATES.length)]!;")
    lines.append("}")
    lines.append("")
    lines.append("export const actionPool: Action[] = [")
    
    items = sorted(groups.items(), key=lambda x: (x[1]['meta'][0], x[1]['meta'][2], x[1]['meta'][4], x[1]['meta'][1], x[1]['meta'][7]))
    
    for i, (_, data) in enumerate(items):
        id_, typ, phase, terrains, dmg_int, chance_mult, required_item, acquisitions = data["meta"]
        templates = data["templates"]
        
        same_id = [x for x in groups.values() if x['meta'][0] == id_]
        safe_id = re.sub(r"[^a-zA-Z0-9_]", "_", id_)
        if len(same_id) > 1:
            suffix = f"_d{dmg_int}"
            if acquisitions and sum(1 for x in same_id if x['meta'][4] == dmg_int) > 1:
                suffix += f"_{re.sub(r'[^a-zA-Z0-9_]', '_', acquisitions)}"
            action_id = f"{safe_id}{suffix}"
        else:
            action_id = safe_id
        
        tr = ", ".join(json.dumps(t) for t in terrains)
        tem = ",\n      ".join(json.dumps(t, ensure_ascii=False) for t in templates)
        
        block = f"  {{\n"
        block += f"    id: {json.dumps(action_id)},\n"
        block += f"    type: {json.dumps(typ)},\n"
        block += f"    phase: {json.dumps(phase)},\n"
        if terrains:
            block += f"    terrainRequired: [{tr}],\n"
        block += f"    damageDelta: {dmg_int},\n"
        if chance_mult != 1.0:
            chance_val = int(chance_mult) if chance_mult.is_integer() else chance_mult
            block += f"    chanceMultiplier: {chance_val},\n"
        if required_item:
            block += f"    requiredItem: {json.dumps(required_item)},\n"
        if typ == 'group' and required_item:
            block += f"    groupGateAnyParticipant: true,\n"
        if acquisitions:
            block += f"    giveItem: {json.dumps(acquisitions)},\n"
        block += f"    templates: [\n      {tem}\n    ]\n"
        block += f"  }}"
        lines.append(block + ("," if i < len(items) - 1 else ""))
    
    lines.append("];")
    lines.append("")
    lines.append("export function getActionsForPhase(phase: string): Action[] {")
    lines.append("  return actionPool.filter(action =>")
    lines.append("    action.phase === phase ||")
    lines.append("    (action.phase === 'any' && (phase === 'day' || phase === 'night'))")
    lines.append("  );")
    lines.append("}")
    lines.append("")
    lines.append("export function getCannonText(deathCount: number): string {")
    lines.append("  if (deathCount <= 0) return \"\";")
    lines.append("  if (deathCount === 1) {")
    lines.append("    return getRandomCannonTemplate();")
    lines.append("  }")
    lines.append("  return getRandomCannonGroupTemplate().replace('{deaths}', String(deathCount));")
    lines.append("}")
    lines.append("")
    lines.append("export function getCannonGroupText(deathCount: number): string {")
    lines.append("  if (deathCount <= 0) return \"\";")
    lines.append("  return getRandomCannonGroupTemplate().replace('{deaths}', String(deathCount));")
    lines.append("}")
    lines.append("")
    lines.append("export const majorEventPool: MajorEvent[] = [];")
    
    return "\n".join(lines) + "\n"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/generate-actions.py path/to/Actions.csv")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    if not Path(csv_path).exists():
        print(f"Error: File not found: {csv_path}")
        sys.exit(1)
    
    cannon_templates, cannon_group_templates, groups = parse_actions_csv(csv_path)
    typescript_code = generate_typescript(cannon_templates, cannon_group_templates, groups)
    
    output_path = Path(__file__).parent.parent / "src" / "engine" / "actions.ts"
    output_path.write_text(typescript_code, encoding='utf-8')
    
    print(f"✓ Generated {output_path}")
    print(f"  {len(groups)} actions from {csv_path}")


if __name__ == "__main__":
    main()
