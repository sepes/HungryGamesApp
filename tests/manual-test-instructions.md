# Manual Test Instructions for Hungry Games App

## Prerequisites

- The application must be running on `http://localhost:3000`
- Use `npm start` or `vercel dev` to start the development server
- Browser: Any modern browser (Chrome, Firefox, Edge, Safari)

## Test Environment Setup

1. Open a terminal in the project root directory
2. Run the development server:
   ```bash
   npm start
   # OR for API functionality:
   vercel dev
   ```
3. Open your browser and navigate to `http://localhost:3000`
4. The app should load with the Setup Screen visible

---

## Test Suite 1: Setup Screen

### Test 1.1: Initial State Verification
**Objective**: Verify the setup screen loads correctly

**Steps**:
1. Load `http://localhost:3000`
2. Observe the setup screen

**Expected Results**:
- Page title is "Hunger Games Simulator"
- Three buttons visible: "12 tributes", "24 tributes", "48 tributes"
- "12 tributes" is selected by default
- 12 empty name input fields are displayed (one per district)
- "Randomize Unnamed" button is visible
- "Start the Hunger Games simulation" button is visible at the bottom
- Settings icon is visible in the top-right corner

### Test 1.2: Number of Tributes Selection
**Objective**: Verify tribute count selection works

**Steps**:
1. Click "24 Tributes" button
2. Observe the district count
3. Click "48 Tributes" button
4. Observe the district count
5. Click "12 Tributes" button to return

**Expected Results**:
- Clicking "24 Tributes" displays 24 input fields (12 districts, 2 tributes each)
- Clicking "48 Tributes" displays 48 input fields (12 districts, 4 tributes each)
- Clicking "12 Tributes" displays 12 input fields (12 districts, 1 tribute each)
- Selected button appears visually distinct
- Page layout adjusts appropriately

### Test 1.3: Name Entry (Manual)
**Objective**: Verify manual name entry works

**Steps**:
1. With "12 Tributes" selected, click on the first name input field
2. Type "Test Player 1"
3. Click on the second name input field
4. Type "Test Player 2"
5. Repeat for a few more fields

**Expected Results**:
- Text appears in the input fields as typed
- Names are limited to 30 characters
- Each field accepts alphanumeric characters and spaces

### Test 1.4: Randomize Names Function
**Objective**: Verify the random name generator works

**Steps**:
1. Click the "Randomize Unnamed" button
2. Observe all previously empty name fields

**Expected Results**:
- All empty name fields are populated with random names
- Names follow the pattern: FirstName LastName (e.g., "Zoe Lake", "Gray Iron")
- All names are unique
- Previously filled fields remain unchanged

### Test 1.5: Start Game Validation
**Objective**: Verify game won't start without all names filled

**Steps**:
1. Clear all name fields (refresh page if needed)
2. Try to click "Start the Hunger Games simulation"
3. Fill in all name fields (using "Randomize Unnamed")
4. Click "Start the Hunger Games simulation"

**Expected Results**:
- If names are missing: Error message or button disabled
- If all names filled: Game transitions to Simulation Screen

---

## Test Suite 2: Simulation Screen - Game Progression

**note:** There are normal phases and special events. Game starts with cornucopia special event and every day might introduce special event that replaces day phase.

### Test 2.1: Cornucopia Phase
**Objective**: Verify the initial bloodbath phase works correctly

**Steps**:
1. Complete setup with 12 tributes using "Randomize Unnamed"
2. Click "Start the Hunger Games simulation"
3. Observe the simulation screen

**Expected Results**:
- Screen displays "THE HUNGER GAMES" header
- Phase shows "The Cornucopia"
- Day counter shows "Day: 1"
- Alive counter shows "X/12" (typically 6-9 after Cornucopia)
- Multiple event descriptions are displayed
- Events show:
  - Tribute names highlighted in green
  - Actions like running, grabbing items, killing
  - Some tributes have died (30-50% mortality rate expected)
  - read the activities, report any abnormal or broken.
- "Next Phase" button is visible at bottom-right

### Test 2.2: Day Phase
**Objective**: Verify day cycle progression

**Steps**:
1. From Cornucopia phase, click "Next Phase"
2. Observe the screen

**Expected Results**:
- Phase changes to "Day"
- Day counter remains "Day: 1"
- Alive counter updates (may decrease)
- New events are displayed showing day activities:
  - read the activities, report any abnormal or broken.
- "Next Phase" button remains visible

### Test 2.3: Night Phase
**Objective**: Verify night cycle progression

**Steps**:
1. From Day phase, click "Next Phase"
2. Observe the screen

**Expected Results**:
- Phase changes to "Night"
- Header shows "Day X - Night Falls"
- Day counter remains "Day: 1"
- Alive counter updates (may decrease)
- New events show night activities:
  - Stealth actions
  - Emotional moments
  - Night kills
  - Sleep/rest activities
  - read the activities, report any abnormal or broken.
- Button changes to "Show Fallen"

### Test 2.4: Fallen Tributes Screen
**Objective**: Verify fallen tributes memorial display

**Steps**:
1. From Night phase, click "Show Fallen"
2. Wait and observe

**Expected Results**:
- Phase changes to "Fallen Tributes"
- Day counter advances to "Day: 2"
- Screen displays fallen tributes one at a time:
  - Tribute name in large text
  - District number below name
  - Auto-cycles through each fallen tribute (2-3 seconds each)
- "Hurry up" button appears to skip animation
- After all tributes shown, displays summary:
  - "X cannon shots can be heard in the distance"
  - Bulleted list of all fallen tributes with districts
- "Next Phase" button visible

### Test 2.5: Hurry Up Function
**Objective**: Verify quick skip through fallen tributes

**Steps**:
1. Reach "Fallen Tributes" phase
2. Click "Hurry up" button immediately

**Expected Results**:
- Animation skips individual tribute displays
- Immediately shows summary list of all fallen tributes
- "Next Phase" button appears

---

## Test Suite 3: Tributes Panel

### Test 3.1: Open Tributes Panel
**Objective**: Verify tributes panel displays correctly

**Steps**:
1. During simulation, click "Tributes" button (top-left)
2. Observe the panel

**Expected Results**:
- Panel slides in from left side
- Shows "All Tributes" heading
- Displays all districts in order
- For each tribute shows:
  - Name
  - Kill count
  - Status: "Alive" (green) or death phase (red, e.g., "Fell in Cornucopia")
  - Items collected (if any)
- Scrollable if content exceeds viewport
- "X" close button visible

### Test 3.2: Tribute Status Accuracy
**Objective**: Verify tribute information is accurate

**Steps**:
1. Open tributes panel during simulation
2. Note all tribute kill counts
3. Close panel and observe next event where a tribute kills someone
4. Reopen tributes panel

**Expected Results**:
- Kill counts increments correctly
- Status changes from "Alive" to death phase when tribute dies
- Items list updates when tributes collect items
- All information remains consistent

### Test 3.3: Close Tributes Panel
**Objective**: Verify panel closes properly

**Steps**:
1. Open tributes panel
2. Click the "X" close button

**Expected Results**:
- Panel slides out/closes
- Main simulation screen remains visible
- "Tributes" button still accessible

---

## Test Suite 4: Game End States

### Test 4.1: Game Ends
**Objective**: Verify game completes

**Steps**:
1. Start a new game
2. Click "Next Phase" repeatedly until only 1 tribute remains
3. Click "Next Phase" after final kill

**Expected Results**:
- Phase changes to "Winner Screen"
- Displays winner's name prominently
- Shows winner's statistics:
  - District
  - Total kills
  - Survival time
  - Items collected
- "View History" or similar button available
- "Play Again" or "Reset" button visible

### Test 4.2: Game Ends (No Winner, edge case)
**Objective**: Verify edge case where all tributes die
note: this does not have to be tested, but noted if happens while testing.

**Steps**:
1. Play until you encounter a "TRAGIC END" scenario (rare, may require multiple attempts)
2. OR: Note if this happens during testing

**Expected Results**:
- Phase shows "TRAGIC END"
- Message: "In an unprecedented catastrophe, the final X tributes perished simultaneously on Day Y"
- Lists all final fallen tributes
- Message: "For the first time in history, the Hunger Games conclude with no victor"
- "The Capitol mourns this unprecedented tragedy"
- "Show Fallen" button available

---

## Test Suite 5: Winner Screen

### Test 5.1: Normal Winner Display
**Objective**: Verify winner screen displays correctly with single victor

**Steps**:
1. Complete a full game simulation until one tribute remains
2. Observe the winner screen

**Expected Results**:
- Page displays "Winner" or victory message
- Winner's name displayed prominently at top
- Winner's statistics shown:
  - District number
  - Total kills count
  - Items collected (list with quantities)
  - Survival time or days survived
- Winner's statistics are accurate based on game events
- "View History" or "Show Events" button visible
- "Play Again" or "Reset Game" button visible
- Layout is clean and celebratory
- All text is readable

### Test 5.2: Winner Statistics Accuracy
**Objective**: Verify winner statistics match actual game performance

**Steps**:
1. During game simulation, manually track one tribute:
   - Count their kills
   - Note items they collect
   - Note when they survive to the end
2. When that tribute wins, compare tracked data with displayed statistics

**Expected Results**:
- Kill count matches observed kills
- Items list matches collected items (with correct quantities)
- Survival information is accurate
- District information is correct
- No discrepancies between actual events and displayed stats

### Test 5.3: History Modal from Winner Screen
**Objective**: Verify event history can be viewed from winner screen

**Steps**:
1. From winner screen, click "View History" button
2. Observe the history modal

**Expected Results**:
- Modal opens displaying full event history
- Events listed chronologically from start to finish
- Each event shows:
  - Day number
  - Phase (Cornucopia, Day, Night, Special Event)
  - Event description with tribute names
- Can scroll through all events
- Modal has close button (X)
- Closing modal returns to winner screen

### Test 5.4: History Modal Events Completeness
**Objective**: Verify all game events are recorded in history

**Steps**:
1. Open history modal from winner screen
2. Scroll through entire event list
3. Verify key events are present:
   - Cornucopia events
   - All kills throughout the game
   - Item collections
   - Special events (if any occurred)
   - Final kill that determined winner

**Expected Results**:
- All phases represented in history
- All deaths accounted for (should match total tributes - 1)
- Events are in correct chronological order
- No missing or duplicate events
- Event descriptions are complete and readable

### Test 5.5: Play Again/Reset from Winner Screen
**Objective**: Verify game can be restarted from winner screen

**Steps**:
1. From winner screen, locate "Play Again" or "Reset Game" button
2. Click the button
3. Observe the transition

**Expected Results**:
- Game returns to Setup Screen
- All previous game data cleared
- Name fields are empty
- "12 tributes" is selected by default
- No winner screen data persists
- App ready for new game
-

### Test 5.6: Winner Screen Layout
**Objective**: Verify winner screen is visually appealing and functional

**Steps**:
1. Observe winner screen layout
2. Check all visual elements

**Expected Results**:
- Winner name is prominent and easy to read
- Statistics are organized and easy to scan
- Buttons are clearly visible and labeled
- No overlapping elements
- Proper spacing between sections
- Celebratory tone in design
- All text has proper contrast

### Test 5.7: Tragic End Screen (No Winner)
**Objective**: Verify edge case where all tributes die simultaneously

**Note**: This is a rare scenario. Only test if it occurs naturally during testing.

**Steps**:
1. If "TRAGIC END" screen appears, observe carefully
2. Note all displayed information

**Expected Results**:
- Screen displays "TRAGIC END" heading
- Message states: "In an unprecedented catastrophe, the final X tributes perished simultaneously on Day Y"
- List of all final fallen tributes with districts
- Message: "For the first time in history, the Hunger Games conclude with no victor"
- Message: "The Capitol mourns this unprecedented tragedy"
- No winner statistics shown (since there is no winner)
- "View History" button available
- "Play Again" or "Reset Game" button available
- Tone is somber/tragic rather than celebratory

### Test 5.8: Tragic End History
**Objective**: Verify history works correctly in tragic end scenario

**Steps**:
1. From Tragic End screen, click "View History"
2. Scroll to end of history

**Expected Results**:
- History shows all events including final tragic event
- Final event(s) show multiple deaths simultaneously
- No winner declared in history
- All tribute deaths accounted for
- History modal closes properly

### Test 5.9: Multiple Winners Verification
note: This might become a scenario later. Until then, this test stands. If unexpected results, check dev commits if it is added.
**Objective**: Verify game cannot end with multiple winners

**Steps**:
1. Play multiple games
2. Observe end conditions

**Expected Results**:
- Game always ends with exactly 0 or 1 tribute alive
- Never shows multiple winners
- If multiple tributes somehow survive, game continues until resolved
- System handles all edge cases properly

---

## Test Suite 6: Settings Panel

### Test 6.1: Open Settings Panel
**Objective**: Verify settings panel opens correctly

**Steps**:
1. Click the settings gear icon (top-right)
2. Observe the panel

**Expected Results**:
- Settings panel slides in from right side
- Shows "Settings" heading
- Displays sections:
  - Twitch Chat Integration (with status)
  - Volunteer Collection
  - Game Control (with "Reset Game" button)
  - Debug Terminal
- "X" close button visible

### Test 6.2: Reset Game Function
**Objective**: Verify game reset works

**Steps**:
1. Start a game and progress through a few phases
2. Open settings panel
3. Click "Reset Game" button
4. Confirm reset if prompted

**Expected Results**:
- Game returns to Setup Screen
- All name fields are empty
- "12 tributes" is selected by default
- No simulation data persists

### Test 6.3: Close Settings Panel
**Objective**: Verify settings panel closes

**Steps**:
1. Open settings panel
2. Click "X" close button

**Expected Results**:
- Panel closes/slides out
- Game screen remains unchanged
- Settings button still accessible

---

## Test Suite 7: UI/UX Tests

### Test 7.1: Responsive Layout
**Objective**: Verify layout works at different screen sizes

**Steps**:
1. Test at various widths: 1920px, 1366px, 768px, 375px
2. Observe layout behavior

**Expected Results**:
- All elements remain visible and accessible
- Text remains readable
- Buttons remain clickable
- Panels adjust appropriately
- No overlapping content

### Test 7.2: Button States
**Objective**: Verify interactive elements provide feedback

**Steps**:
1. Hover over buttons
2. Click buttons
3. Observe visual feedback

**Expected Results**:
- Hover states show visual change
- Click states provide feedback
- Disabled buttons appear distinct
- Active/selected buttons are visually different

### Test 7.3: Text Readability
**Objective**: Verify text contrast and readability

**Steps**:
1. Observe all text elements throughout the app
2. Check contrast ratios

**Expected Results**:
- All text meets WCAG AA standards (4.5:1 for normal text)
- Tribute names (green) are readable against dark background
- Red text (dead tributes) is readable
- White text is readable
- No text is too small to read comfortably

---

## Test Suite 8: Edge Cases and Error Handling

### Test 8.1: Empty Names Validation
**Objective**: Verify validation prevents starting with empty names

**Steps**:
1. On setup screen, leave some names empty
2. Attempt to click "Start the Hunger Games simulation"

**Expected Results**:
- Button is disabled OR
- Error message appears OR
- Visual indication that names are required

### Test 8.2: Duplicate Names
**Objective**: Verify handling of duplicate names

**Steps**:
1. Enter the same name in two different fields
2. Attempt to start the game

**Expected Results**:
- Error message indicating names must be unique OR
- System auto-modifies names to make them unique OR
- Game prevents starting with duplicate names

### Test 8.3: Special Characters in Names
**Objective**: Verify name input validation

**Steps**:
1. Try entering special characters: @, #, $, %, &, etc.
2. Try entering very long names (>30 characters)
3. Try entering emoji or unicode characters

**Expected Results**:
- Special characters either accepted or rejected gracefully
- Names truncate at 30 characters
- No crashes or errors
- Unicode characters either work or are gracefully rejected

### Test 8.4: Rapid Clicking
**Objective**: Verify system handles rapid input

**Steps**:
1. During simulation, rapidly click "Next Phase" button multiple times
2. Rapidly open/close panels

**Expected Results**:
- No double-processing of phases
- No UI glitches
- Smooth transitions maintained
- No crashes

---

## Test Suite 9: Data Persistence and History

### Test 9.1: Event History (if available)
**Objective**: Verify event history tracking

**Steps**:
1. During or after simulation, look for "View History" or similar button
2. Click to view history

**Expected Results**:
- Modal or panel opens showing all events
- Events listed in chronological order
- Can scroll through all events
- Events show phase and day
- Close button works

### Test 9.2: Statistics Tracking
**Objective**: Verify kill counts and stats are accurate

**Steps**:
1. Track a specific tribute through simulation
2. Note each kill they make
3. Check final statistics

**Expected Results**:
- Kill counts match observed events
- Survival time is accurate
- Items collected are listed correctly
- All statistics are consistent

---

## Test Suite 10: Performance Tests

### Test 10.1: Load Time
**Objective**: Measure initial load performance

**Steps**:
1. Clear browser cache
2. Navigate to `http://localhost:3000`
3. Note time to interactive

**Expected Results**:
- Page loads within 3 seconds
- All assets load without errors
- No console errors
- Fonts and styles load properly

### Test 10.2: Animation Smoothness
**Objective**: Verify smooth transitions

**Steps**:
1. Progress through multiple game phases
2. Open and close panels
3. Observe all transitions

**Expected Results**:
- 60 FPS maintained during animations
- No stuttering or lag
- Smooth panel transitions
- Smooth page transitions

### Test 10.3: Memory Leaks
**Objective**: Verify no memory issues during extended use

**Steps**:
1. Open browser DevTools (F12)
2. Go to Performance/Memory tab
3. Play through multiple complete games
4. Monitor memory usage

**Expected Results**:
- Memory usage stays stable
- No continuous memory growth
- Game remains responsive after multiple runs

---

## Test Suite 11: Accessibility Tests

### Test 11.1: Keyboard Navigation
**Objective**: Verify keyboard accessibility

**Steps**:
1. Use Tab key to navigate through all interactive elements
2. Use Enter/Space to activate buttons
3. Use Escape to close modals/panels

**Expected Results**:
- All interactive elements are reachable via Tab
- Focus indicators are clearly visible
- Tab order is logical
- Enter/Space activate focused elements
- Escape closes modals where appropriate

### Test 11.2: Screen Reader Compatibility
**Objective**: Verify ARIA labels and screen reader support

**Steps**:
1. Use a screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate through setup
3. Progress through simulation

**Expected Results**:
- All buttons announce their purpose
- Status updates are announced
- Phase changes are announced
- Tribute statuses are readable
- All content is accessible

### Test 11.3: Color Contrast
**Objective**: Verify WCAG AA compliance

**Steps**:
1. Use browser DevTools accessibility checker
2. Check contrast ratios for all text

**Expected Results**:
- All text meets 4.5:1 ratio (normal text)
- Large text meets 3:1 ratio
- Interactive elements meet contrast requirements
- No accessibility warnings

---

## Test Suite 12: Browser Compatibility

### Test 12.1: Chrome/Edge (Chromium)
**Objective**: Verify full functionality in Chrome/Edge

**Steps**:
1. Test all core features in Chrome
2. Test all core features in Edge

**Expected Results**:
- All features work identically
- No browser-specific issues
- Performance is good
- No console errors

### Test 12.2: Firefox
**Objective**: Verify compatibility with Firefox

**Steps**:
1. Test all core features in Firefox

**Expected Results**:
- All features work correctly
- Layout is consistent
- No Firefox-specific bugs

### Test 12.3: Safari
**Objective**: Verify compatibility with Safari

**Steps**:
1. Test all core features in Safari (if available)

**Expected Results**:
- All features work correctly
- Layout is consistent
- No Safari-specific bugs

---

## Regression Test Checklist

Use this checklist after any code changes to verify core functionality:

- [ ] App loads without errors
- [ ] Setup screen displays correctly
- [ ] Name randomization works
- [ ] Game starts successfully
- [ ] Cornucopia phase displays
- [ ] Day phase displays
- [ ] Night phase displays
- [ ] Fallen tributes screen works
- [ ] Tributes panel opens/closes
- [ ] Settings panel opens/closes
- [ ] Reset game works
- [ ] Event text is readable
- [ ] Tribute names are highlighted
- [ ] Kill counts are accurate
- [ ] No console errors
- [ ] No accessibility violations

---

## Known Issues / Edge Cases

Document any issues found during testing:

1. **Tragic End**: Rare scenario where all remaining tributes die simultaneously, resulting in no winner. This is handled but may surprise users.

2. **Name Truncation**: Names longer than 30 characters are cut off. Consider if this limit is appropriate.

3. **Settings Panel Overlap**: On very small screens (<375px), settings panel may overlap content.

---

## Test Results Template

```
Test Date: ________________
Tester Name: ______________
Browser: __________________ (Version: ____)
OS: ________________________

Test Suite 1: Setup Screen
- Test 1.1: [ ] Pass [ ] Fail [ ] N/A
- Test 1.2: [ ] Pass [ ] Fail [ ] N/A
...

Issues Found:
1. _____________________________________
2. _____________________________________

Notes:
_________________________________________
_________________________________________
```

---

## Conclusion

After completing all test suites, verify:
- ✓ All core game mechanics work
- ✓ UI is responsive and accessible
- ✓ No critical bugs
- ✓ Performance is acceptable
- ✓ User experience is smooth

Ready for deployment: [ ] Yes [ ] No

Issues requiring fix before deployment:
_________________________________________
_________________________________________


 