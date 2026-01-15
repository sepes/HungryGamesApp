# Hunger Games Engine

Complete rewrite of the game engine with arena generation, terrain-restricted actions, and weighted decay RNG.

## Architecture

### 1. arena.ts
Arena generator that creates static terrain at game start:
- **Terrain types**: Forest (Oak/Pine/Rainforest/Mixed), Rivers, Lake (with Islands), Mountain, Desert, Plains, Hills
- **Generation**: Probabilistic terrain selection based on configured percentages
- **Prologue**: Generates arena description text (structure only, templates added later)

### 2. actions.ts
Action definitions with terrain requirements:
- **Action structure**: id, type (solo/versus/group), phase, terrainRequired, deathChance, templates
- **Terrain validation**: Actions only available if arena has ALL required terrains
- **Template placeholders**: {player}, {killer}, {victim}, {player1-3}, {killer1-3}, {victim1-3}
- **Major events**: Can replace full Day/Night loop with dayTemplates and nightTemplates

### 3. actionResolver.ts
Weighted decay RNG system:
- **Weight decay**: After use, action weight *= 0.3 (70% reduction)
- **Daily reset**: All weights reset to 1.0 after each day cycle (Fallen phase)
- **Selection**: Weighted random from terrain-valid actions
- **Participant assignment**: Resolves solo/versus/group actions with appropriate players

### 4. inventory.ts
Inventory management system:
- **Item categories**: Weapons (permanent), Tools (permanent), Consumables (depletable)
- **Capacity limits**: Max 2 weapons, 1 tool without backpack, unlimited with backpack
- **Stat effects**: Items affect kill/survival probabilities
- **Looting**: Automatic looting on kills (respects capacity)

### 5. gameLoop.ts
Main game controller (replaces old gameEngine.ts):
- **Phase cycle**: Prologue → Cornucopia → Day → Night → Fallen → (loop) → Victory → Epilogue
- **Victory condition**: Immediate check after any death, configurable winnerCount (default: 1)
- **2-player fix**: Removed guards that prevented kills when only 2 players remain
- **Frontend compatibility**: Same interface as old GameEngine

### 6. types.ts
Engine-specific type definitions:
- Arena, TerrainType, Action, MajorEvent, ResolvedAction, GameConfig

## Key Features

### Arena System
- **Static generation**: Arena created once at game start
- **Terrain restrictions**: Actions require specific terrain combinations
- **Prologue**: Arena description shown before Cornucopia

### Weighted Decay RNG
- **Variety**: Prevents action repetition through weight decay
- **Recovery**: Full weight reset after each day cycle
- **Terrain-aware**: Only selects actions valid for current arena

### Inventory System
- **Simplified uses**: Only consumables deplete (medicine, matches, food, water)
- **Capacity management**: Backpack expands tool capacity
- **Stat integration**: Items affect combat and survival probabilities

### Victory System
- **Immediate detection**: Game ends as soon as winnerCount players remain
- **Multiple victors**: Supports team victories (future-proofed)
- **Epilogue**: Separate phase after victory announcement

## Usage

```typescript
import { GameLoop } from './gameLoop';

const engine = new GameLoop(players);
const result = engine.nextSegment();

// result contains:
// - phase: current game phase (prologue, cornucopia, day, night, fallen, winner, epilogue)
// - events: array of event strings
// - winner: first victor (for compatibility)
// - winners: all victors array
// - alive: number of alive players
// - total: total players
// - tributeData: fallen tribute data (for Fallen phase animation)
```

## Console Configuration

```typescript
window.HungryGames = {
  getConfig: () => ({ winnerCount: number }),
  setWinnerCount: (count: number) => void
};
```

## Phase Flow

1. **Prologue** - Arena description (once at start)
2. **Cornucopia** - Initial bloodbath (once after prologue)
3. **Day** - Exploration, encounters, survival
4. **Night** - Rest, ambush, exposure dangers
5. **Fallen** - Announce deaths, reset action weights
6. **Victory** - Triggered when winnerCount or fewer players remain
7. **Epilogue** - Final narrative (after victory)

## Notes

- **No templates generated**: All template structures are placeholders. Actual content added separately.
- **Terrain requirements**: Actions use AND logic - arena must have ALL listed terrains.
- **Weight reset**: Happens after Fallen phase, before next Day phase.
