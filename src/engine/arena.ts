import type { Arena, TerrainType } from './types';

// Terrain generation chances (0–1) from Prologue.csv
const TERRAIN_CHANCES: Partial<Record<TerrainType, number>> = {
  'forest': 0.85,
  'river': 0.75,
  'lake': 0.5,
  'islands': 0.05,
  'mountain': 0.6,
  'desert': 0.1,
  'plains': 0.3,
  'hills': 0.3,
};

export class ArenaGenerator {
  private arena: Arena;

  constructor() {
    this.arena = this.generateArena();
  }

  getArena(): Arena {
    return this.arena;
  }

  private generateArena(): Arena {
    const terrains = new Set<TerrainType>();
    let hasIslands = false;

    const baseTerrains: TerrainType[] = [
      'forest', 'river', 'lake', 'mountain', 'desert', 'plains', 'hills'
    ];

    for (const terrain of baseTerrains) {
      const chance = TERRAIN_CHANCES[terrain] ?? 0;
      if (chance > 0 && Math.random() < chance) {
        terrains.add(terrain);
      }
    }

    if (terrains.has('lake')) {
      const islandChance = TERRAIN_CHANCES['islands'] ?? 0;
      if (islandChance > 0 && Math.random() < islandChance) {
        terrains.add('islands');
        hasIslands = true;
      }
    }

    if (terrains.size === 0) {
      terrains.add('no_terrain');
    }

    return {
      terrains,
      hasIslands
    };
  }

  /**
   * Generate prologue text describing the arena.
   * Uses templates from action_templates.xlsx - Prologue.csv
   */
  generatePrologue(): string[] {
    // Terrain descriptions from Prologue.csv
    const terrainDescriptions: Record<string, string> = {
      'forest': "Tributes can smell the forest. Full of animals to hunt and berries to pick. Tall lush trees that provides shelter.",
      'river': "In middle of the arena tributes can see a wide running river that fills the air with moisture.",
      'lake': "Sunshine reflects from a large lake.",
      'islands': "a Body of water hosts an island in the middle. The lighting makes it look like a place worth reaching.",
      'mountain': "Huge mountain can be seen in the distance not too far away. There is a uncanny artificial feeling to it.",
      'desert': "Part of the horizon seems to be dry and dead. Wind is carrying sand particles in tributes every cavity.",
      'plains': "Tall grass makes the arena look like a green ocean.",
      'hills': "Some areas is left hidden behind shallow hills.",
      'no_terrain': "The arena seems to be a large, walled, concrete flat with nothing but the cornucopia in the center.",
    };

    const lines: string[] = [];
    
    // Start text
    lines.push("Tributes rise from the ground. Fresh air is making their heads spin. They see the arena for the first time.");
    lines.push('');

    // Add terrain descriptions for present terrains in consistent order
    const terrainOrder: TerrainType[] = [
      'forest', 'river', 'lake', 'islands', 'mountain', 'desert', 'plains', 'hills', 'no_terrain'
    ];
    
    const sortedTerrains = Array.from(this.arena.terrains).sort((a, b) => {
      const aIndex = terrainOrder.indexOf(a);
      const bIndex = terrainOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    for (const terrain of sortedTerrains) {
      const description = terrainDescriptions[terrain];
      if (description) {
        lines.push(description);
      } else if (terrain in terrainDescriptions) {
        // Terrain exists in map but has no description yet
        lines.push(`[TODO: ${terrain} description]`);
      } else {
        // Unknown terrain type
        lines.push(`[Unknown terrain: ${terrain}]`);
      }
    }

    // End text
    lines.push('');
    lines.push("The arena looks back at the tributes.");

    return lines;
  }

  /**
   * Check if arena has any of the required terrains
   */
  hasTerrains(required: TerrainType[]): boolean {
    if (!required || required.length === 0) return true;
    return required.some(terrain => this.arena.terrains.has(terrain));
  }
}
