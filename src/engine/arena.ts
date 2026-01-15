import type { Arena, TerrainType } from './types';

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
    let forestType: 'oak' | 'pine' | 'rainforest' | 'mixed' | undefined;
    let hasIslands = false;

    // Forest: 85% chance
    if (Math.random() < 0.85) {
      const forestRoll = Math.random();
      if (forestRoll < 0.60) {
        terrains.add('forest');
        terrains.add('forest_oak');
        forestType = 'oak';
      } else if (forestRoll < 0.65) {
        terrains.add('forest');
        terrains.add('forest_pine');
        forestType = 'pine';
      } else if (forestRoll < 0.70) {
        terrains.add('forest');
        terrains.add('forest_rainforest');
        forestType = 'rainforest';
      } else {
        terrains.add('forest');
        terrains.add('forest_mixed');
        forestType = 'mixed';
      }
    }

    // Rivers: 75% chance
    if (Math.random() < 0.75) {
      terrains.add('river');
    }

    // Lake: 50% chance
    if (Math.random() < 0.50) {
      terrains.add('lake');
      // Islands: 5% chance (of lake, so 2.5% overall)
      if (Math.random() < 0.05) {
        terrains.add('lake_islands');
        hasIslands = true;
      }
    }

    // Mountain: 60% chance
    if (Math.random() < 0.60) {
      terrains.add('mountain');
    }

    // Desert: 10% chance
    if (Math.random() < 0.10) {
      terrains.add('desert');
    }

    // Plains: 30% chance
    if (Math.random() < 0.30) {
      terrains.add('plains');
    }

    // Hills: 30% chance
    if (Math.random() < 0.30) {
      terrains.add('hills');
    }

    return {
      terrains,
      forestType,
      hasIslands
    };
  }

  /**
   * Generate prologue text describing the arena.
   * 
   * This is a stub - actual text will be added later.
   * 
   * Expected format:
   * - Array of strings, each representing a line
   * - Can use {terrain} placeholders if needed
   * - Example:
   *   [
   *     "The arena opens before the tributes...",
   *     "Dense oak forests stretch to the horizon, broken by winding rivers.",
   *     "In the distance, mountains pierce the sky.",
   *     ""
   *   ]
   */
  generatePrologue(): string[] {
    // TODO: Implement actual prologue generation
    // For now, return structure example
    return [
      "=== ARENA PROLOGUE ===",
      "",
      "The arena has been generated with the following terrain:",
      ...Array.from(this.arena.terrains).map(t => `  - ${t}`),
      "",
      "// TODO: Replace with actual narrative prologue text"
    ];
  }

  /**
   * Check if arena has all required terrains
   */
  hasTerrains(required: TerrainType[]): boolean {
    if (!required || required.length === 0) return true;
    return required.every(terrain => this.arena.terrains.has(terrain));
  }
}
