# Hunger Games Engine

Damage-based simulation (0–100, death when **damage &gt; 100**), uniform random template choice, optional weapon/tool **gates** only.

## Data Source

All narrative content sourced from `action_templates.xlsx`:
- **Actions.csv** → `actions.ts` actionPool
- **Prologue.csv** → `arena.ts` generatePrologue()
- **MajorEvents.csv** → documented in `majorEvents.md` (not yet implemented)
- **Lists.csv** → reference data for valid types/phases/terrains/weapons

## Architecture

### 1. arena.ts
Arena generator that creates static terrain at game start:
- **Terrain types**: Forest, River, Lake, Islands, Mountain, Desert, Plains, Hills, No Terrain (`no_terrain` fallback when none roll)
- **Generation**: Probabilistic terrain selection based on configured percentages (Forest 85%, River 75%, Lake 50%, etc.)
- **Prologue**: Generates arena description from Prologue.csv templates
  - Shows terrains present in the arena with their descriptions
  - Displays `[TODO: terrain description]` for terrains without CSV text yet

### 2. actions.ts
Action definitions from Actions.csv:
- **Source**: Generated from `action_templates.xlsx - Actions.csv` (integer damage 0–100)
- **Action structure**: id, type (solo/versus/group), phase, terrainRequired, **damageDelta**, **templates**, optional **requiredItem** / **giveItem**
- **Terrain validation**: Actions are available if the arena has ANY of the listed terrains (OR logic, e.g. `river, lake` requires river or lake)
- **Template placeholders**: {player}, {killer}, {victim}, {player1-3}, {killer1-3}, {victim1-3}
- **Cannon sounds**: Random cannon template shown after deaths (templates defined in actions.ts)
- **Weapon/tool gates**: CSV "weapon/tool" column → `requiredItem`
- **Split actions**: Same id with different damage values becomes separate actions (e.g. `climb_tree_d0`, `climb_tree_d2`)

### 3. templateEngine.ts (replaces old actionResolver.ts)
- **Selection**: Uniform random among terrain-valid actions (with beat retry if participants or gates fail)
- **Damage**: Same **damageDelta** applied to every target in the beat; stored damage clamped to 0–100
- **Death threshold**: Death at damage >= 100
- **Death order**: Higher overflow dies first
- **Alliances**: Versus never picks allied pairs; group never picks a set that contains an allied pair; alliances clear when no outsiders remain (see `allianceRules.ts`)
- **Item acquisition**: Actions with `giveItem` field grant items to participants (solo/group) or killer (versus)

### 4. allianceRules.ts
Alliance management and dissolution:
- **Symmetric alliances**: Both players must list each other's ID
- **Targeting prevention**: Versus/group actions skip allied pairs
- **Auto-dissolution**: When everyone alive is in one alliance component, alliances clear

### 5. inventory.ts
Inventory management system:
- **Gating only**: Tracks items carried by each tribute (`hasItem`, `addItemToInventory`)
- **Acquisition**: Items granted via `giveItem` field in actions and checked via `requiredItem`

### 6. gameLoop.ts
Main game controller (replaces old gameEngine.ts):
- **Phase cycle**: Prologue → Cornucopia → Day → Night → Fallen → (loop) → Victory → Epilogue
- **Victory condition**: Immediate check after any death, configurable winnerCount (default: 1)
- **2-player fix**: Removed guards that prevented kills when only 2 players remain
- **Frontend compatibility**: Same interface as old GameEngine
- **Cornucopia / day / night**: Several **damage beats** per segment (proto counts in code)

### 7. types.ts
Engine-specific type definitions:
- Arena, TerrainType, Action, MajorEvent, GameConfig

## Key Features

### Arena System
- **Static generation**: Arena created once at game start
- **Terrain restrictions**: Actions require specific terrain combinations
- **Prologue**: Arena description shown before Cornucopia

### Template RNG
- **Uniform**: No weights; tune odds by adding/removing template rows

### Inventory System
- **Template-driven**: Items (`knife`, `medkit`, etc.) are acquired from actions with `giveItem` and gate actions with `requiredItem`

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
5. **Fallen** - Announce deaths from the preceding day/night
6. **Victory** - Triggered when winnerCount or fewer players remain
7. **Epilogue** - Final narrative (after victory)

## Simulation Test

`gameSimulation.test.ts` plays many full games headlessly and checks engine invariants. Run it after regenerating `actions.ts` or changing engine logic.

```bash
CI=true npx react-scripts test src/engine/gameSimulation.test.ts --watchAll=false

# More games / different tribute count
SIM_GAMES=1000 SIM_TRIBUTES=24 CI=true npx react-scripts test src/engine/gameSimulation.test.ts --watchAll=false
```

It fails when:
- A game does not reach victory within 1000 segments
- A game ends with anything other than exactly one survivor
- Victory is returned while more than one tribute was alive (the final phase prints would be lost)
- A living tribute has damage outside 0-99
- A tribute alive at the start of a day/night phase is not named in that phase's prints

It also logs a summary: segments per game and the number of `[TODO: No viable template]` lines (missing templates).

## Notes

- **All templates from CSV**: No generated content; everything comes from `action_templates.xlsx`
- **Phase "any"**: Means day or night only. It never applies to special phases like cornucopia or major events
- **Terrain requirements**: Actions use OR logic - arena needs at least one of the listed terrains (e.g. "river, lake" requires river or lake)
- **Regenerating actions.ts**: When CSV changes, re-run the Python script that parses Actions.csv and outputs TypeScript
