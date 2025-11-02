# Hunger Games Simulator

A text-based Hunger Games simulator built with React. Create custom tributes, watch them compete in the arena, and track detailed statistics throughout the simulation.

## Features

- Customizable tributes (12, 24, or 48 participants)
- Event-driven gameplay with narrative descriptions
- Phase-based progression: Cornucopia bloodbath → Day/Night cycles → Victory
- Comprehensive statistics tracking (kills, survival time, items)
- Event history and detailed winner screen
- Accessibility-compliant interface (AA standards)
- Settings panel for advanced configuration

## Technology Stack

- **React 18.2.0** - UI framework
- **React Scripts 5.0.1** - Build tooling and development server
- **Bootstrap 5.3.8** - UI component library
- **SASS/SCSS** - Styling with CSS Modules
- **Vanilla JavaScript** - Game engine logic

## Installation & Setup

### Prerequisites

- Node.js (version 14 or higher recommended)

### Installation

```bash
npm ic
```

**Note:** `npm ic` is short for `npm install --ignore-scripts`, which prevents execution of lifecycle scripts during installation. This protects against supply chain attacks. This is now the recommended installation method for npm packages.

### Running the Application

Start the development server:

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

The optimized build will be created in the `build/` directory.

## How to Use the App

1. **Setup Phase**
   - Select the number of tributes (12, 24, or 48)
   - Enter names for each tribute manually, or use "Randomize Unnamed" to auto-generate names
   - Names must be unique and are limited to 30 characters
   - Click "Start the Games" when ready

2. **Simulation Phase**
   - The simulation begins with the Cornucopia bloodbath
   - Click "Next" to progress through each phase
   - Phases cycle: Day → Night → Fallen tributes → Next Day
   - Events are displayed in real-time showing actions, deaths, and interactions

3. **Winner Screen**
   - View the final winner and their statistics
   - Review complete event history
   - See leaderboards and survival statistics
   - Reset to start a new simulation

## Project Structure

```
src/
├── components/          # React UI components
│   ├── SetupScreen/     # Initial game setup interface
│   ├── SimulationScreen/# Main simulation display
│   ├── WinnerScreen/    # Victory and statistics screen
│   ├── TributesPanel/   # Tribute status display
│   ├── TributeList/     # List of tributes
│   ├── HistoryModal/    # Event history viewer
│   ├── SettingsPanel/   # Configuration panel
│   └── DebugTerminal/   # Developer debug tools
├── engine/              # Game logic (see Game Engine section)
│   ├── eventGenerator.js
│   ├── eventTemplates.js
│   ├── gameEngine.js
│   └── README.md        # Detailed engine documentation
├── styles/              # Global SCSS
│   ├── global.scss      # Global styles
│   ├── _variables.scss  # SCSS variables
│   ├── _theme.scss      # Theme configuration
│   └── _mixins.scss     # Reusable SCSS mixins
├── utils/               # Helper utilities
│   ├── nameGenerator.js # Random name generation
│   ├── terminalContext.js # Debug terminal context
│   └── useFocusTrap.js  # Accessibility focus management
├── App.jsx              # Main application component
└── index.js             # Application entry point
```

## Game Engine Architecture

The game engine is built with three core modules. For detailed technical documentation, see `src/engine/README.md`.

### EventGenerator (`eventGenerator.js`)

- Creates events based on predefined templates
- Handles player state updates (kills, deaths, items)
- Ensures balanced mortality rates
- Formats templates with actual player names and items

### Event Templates (`eventTemplates.js`)

Events organized by game phase:

- **Cornucopia**: Initial bloodbath with kills, escapes, and supply grabs
- **Day**: Hunting, survival, deaths, and neutral exploration events
- **Night**: Stealth kills, environmental deaths, survival, and emotional events
- **Special**: Arena-wide events affecting all tributes (10% chance per day)

### GameEngine (`gameEngine.js`)

- Controls overall game progression
- Manages phase transitions: Cornucopia → Day → Night → Fallen cycle
- Detects winner when one tribute remains
- Provides statistics and leaderboards

### Balanced Gameplay

- **Cornucopia**: 30-50% mortality rate in the initial bloodbath
- **Day/Night cycles**: Gradual attrition with varied event types
- **Special events**: 10% chance of arena-wide events each day
- **Rich narrative**: 10+ templates per event type to avoid repetition

### Usage Example

```javascript
import { GameEngine } from './engine/gameEngine';

const engine = new GameEngine(players);
const result = engine.nextSegment();

// Result contains:
// - phase: current game phase
// - events: array of event strings
// - winner: winning player (if game over)
// - day: current day number
```

## Key Features

### Accessibility

- WCAG 2.1 AA standards compliance (alleged, I'll try my best, report if there is problems)
- ARIA labels and roles throughout the interface
- Focus trap utilities for modal dialogs
- Keyboard navigation support
- Screen reader-friendly announcements

### Statistics Tracking

- Kill counts per tribute
- Survival time (phase and day of death)
- Items collected during gameplay
- District affiliation
- Complete event history

### Developer Features

- Debug terminal for testing (accessible via settings)
- Game balance testing utilities (`test-game-balance.js`)
- Console access to major event configuration
- Terminal context for development insights

## Development Notes

### Component Architecture

- All components use **CSS Modules** (`.module.scss`) for scoped styling
- Component structure follows React best practices with hooks
- State management handled with React's built-in hooks

### Styling

- Global styles defined in `src/styles/global.scss`
- Theme variables in `_theme.scss` and `_variables.scss`
- Mixins for reusable style patterns in `_mixins.scss`
- Bootstrap 5 classes available throughout

### Accessibility Utilities

- `useFocusTrap.js`: Custom hook for trapping focus within modals
- ARIA live regions for dynamic content announcements
- Semantic HTML with proper heading hierarchy

### Advanced Configuration

During gameplay, access the browser console to configure major event settings:

```javascript
// View current configuration
window.HungryGames.majorEventConfig

// Update configuration
window.HungryGames.updateMajorEventConfig({
  majorEventChance: 0.15,
  maxEventsPerDay: 3
})
```

## Testing

```bash
npm test
```

Launches the test runner in interactive watch mode.

## License

This project is private and not licensed for public use.

---

For detailed information about the game engine internals, see `src/engine/README.md`.

