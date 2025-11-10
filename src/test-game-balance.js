// TODO: Make test folder for all the tests
// Simple test to verify game balance
import { GameEngine } from './engine/gameEngine.js';

// Create test players
const testPlayers = [
    { id: '1', name: 'Test Player 1', district: 1, isAlive: true, kills: 0, items: [] },
    { id: '2', name: 'Test Player 2', district: 1, isAlive: true, kills: 0, items: [] },
    { id: '3', name: 'Test Player 3', district: 2, isAlive: true, kills: 0, items: [] },
    { id: '4', name: 'Test Player 4', district: 2, isAlive: true, kills: 0, items: [] },
    { id: '5', name: 'Test Player 5', district: 3, isAlive: true, kills: 0, items: [] },
    { id: '6', name: 'Test Player 6', district: 3, isAlive: true, kills: 0, items: [] }
];

function testGameBalance() {
    console.log('Testing game balance...');

    const engine = new GameEngine(testPlayers);
    let segmentCount = 0;
    let maxSegments = 50; // Safety limit

    while (!engine.gameOver && segmentCount < maxSegments) {
        const result = engine.nextSegment();
        segmentCount++;

        console.log(`Segment ${segmentCount}: ${result.phase}`);
        console.log(`Events: ${result.events.length}`);
        console.log(`Alive: ${engine.players.filter(p => p.isAlive).length}`);

        if (result.winner) {
            console.log(`Winner: ${result.winner.name} with ${result.winner.kills} kills`);
            break;
        }
    }

    if (segmentCount >= maxSegments) {
        console.log('Game did not complete within safety limit');
    }

    console.log(`Game completed in ${segmentCount} segments`);
}

// Export for potential use
export { testGameBalance };