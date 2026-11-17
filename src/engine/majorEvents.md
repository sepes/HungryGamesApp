# Major Events (Future Implementation)

Major events from `action_templates.xlsx - MajorEvents.csv` are structured but not yet implemented in the engine.

## Structure

Major events have:
- **system** rows: announcement text (no player action)
- **solo/versus/group** rows: player-specific actions with damage values
- **day/night** phases: events span both periods

## Available Events

### flood
- **Day (system)**: "The river overflows its banks..."
- **Day (solo, 10 damage)**: {player} struggles against the rising water
- **Night (system)**: "The floodwaters recede..."
- **Night (solo, 0 damage)**: {player} finds higher ground
- **Terrain required**: river, plains

### fire
- **Day (system)**: "Gamemakers ignites a wide wildfire to get the tributes closer together"
- **Day actions**:
  - Solo at river/lake (20 dmg): {player} finds their way into a body of water while getting just a bit of burns
  - Versus (80 dmg): {killer} finds {victim} burning on the ground and kicks them
  - Solo (50 dmg): {player} got severe burns from the fire
  - Group in forest (30 dmg): {player} and {player} help each other to run away between burning trees
- **Night actions**:
  - Solo with medickit (-20 dmg): {player} treats their burns they sigh when the cream hits their skin
  - Solo in forest/hills/mountain (-20 dmg): {player} finds already cooked rabbit to eat
  - Solo (0 dmg): {player} kept coughing their lungs out but were fine
  - Solo (20 dmg): [empty template]
- **Terrain required**: forest, plains

### intervention
- **System announcement**: "Gamemakers has desided to end the games in final bloodbath because citizens of the Capitol started to be bored with the games lasting a month. Resulting a pack of mutants to be released in the arena. Killing tributes one by one the mutants feasted on their flesh."
- Forces final confrontation/bloodbath

## Implementation Notes

When major events are added to the engine:
1. Pick event based on terrain compatibility and random chance
2. Replace day/night cycle with major event phases
3. System announcements shown at start of each phase
4. Player actions resolved as damage beats (similar to normal day/night)
5. Return to normal day/night cycle after event concludes
