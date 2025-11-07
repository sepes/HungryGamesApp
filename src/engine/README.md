# Hunger Games Event Generation Engine

This engine provides a comprehensive text-based event generation system for the Hunger Games simulator.

## Architecture

### 1. eventTemplates.js
Contains all event templates organized by game phase:
- **Cornucopia**: Initial bloodbath with kills, escapes, and supply grabs
- **Day**: Hunting, survival, deaths, and neutral events
- **Night**: Stealth kills, environmental deaths, survival, and emotional events
- **Special**: Arena-wide events that affect all tributes

### 2. eventGenerator.js
Main event generation logic:
- **EventGenerator class**: Handles event creation and player state updates
- **Balanced mortality**: Ensures realistic death rates (30-50% in cornucopia)
- **Template formatting**: Replaces placeholders with actual player names and items
- **State tracking**: Updates player kills, deaths, and items

### 3. gameEngine.js
Game flow controller:
- **GameEngine class**: Manages overall game progression
- **Phase management**: Handles cornucopia → day → night → fallen cycle
- **Winner detection**: Automatically ends game when one tribute remains
- **Statistics**: Provides leaderboards and survival stats

## Key Features

### Balanced Gameplay
- **Mortality rates**: 30-50% die in cornucopia, gradual attrition afterward
- **Event variety**: 10+ templates per event type to avoid repetition
- **Special events**: 8% chance during day, 5% chance during night

### Rich Narrative
- **Detailed events**: Specific weapons, items, and actions
- **Emotional depth**: Night events include psychological elements
- **Realistic progression**: Events become more desperate as tributes die

### State Management
- **Player tracking**: Kills, deaths, items, and survival status
- **District awareness**: Events reference player districts
- **Statistics**: Comprehensive tracking for end-game summaries

## Usage

```javascript
import { GameEngine } from './gameEngine';

const engine = new GameEngine(players);
const result = engine.nextSegment();

// result contains:
// - phase: current game phase
// - events: array of event strings
// - winner: winning player (if game over)
// - day: current day number
```

## Event Types

### Cornucopia Events
- **Kills**: Direct combat with weapons
- **Escapes**: Fleeing with or without supplies
- **Supplies**: Grabbing survival items

### Day Events
- **Kills**: Hunting and ambushes
- **Deaths**: Environmental hazards
- **Survival**: Finding resources
- **Neutral**: Exploration and planning

### Night Events
- **Kills**: Stealth attacks
- **Deaths**: Environmental and psychological
- **Survival**: Rest and recovery
- **Emotional**: Psychological elements

### Special Events
- Arena-wide events that affect all tributes
- Natural disasters, supply drops, mutt releases
- 8% chance during day phase, 5% chance during night phase

