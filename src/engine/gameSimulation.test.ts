import { describe, expect, test } from '@jest/globals';
import { GameLoop } from './gameLoop';
import type { GameSegmentResult, Player } from '../types/game.types';

/**
 * Whole-game simulation. Plays many full games headlessly and checks engine invariants.
 * See src/engine/README.md ("Simulation Test") for usage.
 */

const GAMES = Number(process.env.SIM_GAMES ?? 300);
const TRIBUTES = Number(process.env.SIM_TRIBUTES ?? 12);
const MAX_SEGMENTS = 1000;
const NAME_MARKER = '\u2063';

function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    name: `Tribute${i}`,
    district: String(Math.floor(i / 2) + 1),
    isAlive: true,
    kills: 0,
    diedInPhase: null,
    diedOnDay: null
  })) as unknown as Player[];
}

function aliveOf(loop: GameLoop): Player[] {
  return loop.players.filter(p => p.isAlive);
}

interface GameRun {
  segments: GameSegmentResult[];
  finalAlive: number;
  violations: string[];
}

function playGame(tributes: number): GameRun {
  const loop = new GameLoop(makePlayers(tributes));
  const segments: GameSegmentResult[] = [];
  const violations: string[] = [];

  for (let step = 0; step < MAX_SEGMENTS; step++) {
    const aliveBefore = aliveOf(loop);
    const result = loop.nextSegment();
    segments.push(result);

    if (result.phase === 'winner') {
      if (aliveBefore.length > 1) {
        violations.push(`victory shown while ${aliveBefore.length} tributes were alive (phase prints swallowed)`);
      }
      break;
    }

    const aliveAfter = aliveOf(loop);
    for (const p of aliveAfter) {
      const dmg = p.damage ?? 0;
      if (dmg < 0 || dmg >= 100) {
        violations.push(`${p.name} alive with damage ${dmg} after ${result.phase}`);
      }
    }

    const isActionPhase = result.phase === 'day' || result.phase === 'night';
    if (isActionPhase && aliveAfter.length > 1) {
      const text = result.events.join('\n');
      for (const p of aliveBefore) {
        if (!text.includes(`${NAME_MARKER}${p.name}${NAME_MARKER}`)) {
          violations.push(`${p.name} was not touched in ${result.phase} (day ${loop.day})`);
        }
      }
    }
  }

  return { segments, finalAlive: aliveOf(loop).length, violations };
}

describe('game simulation', () => {
  const runs: GameRun[] = Array.from({ length: GAMES }, () => playGame(TRIBUTES));

  test(`${GAMES} games of ${TRIBUTES} tributes all reach a victory`, () => {
    const unfinished = runs.filter(r => r.segments[r.segments.length - 1]?.phase !== 'winner');
    expect(unfinished.length).toBe(0);
  });

  test('every game ends with exactly one survivor', () => {
    const counts = runs.map(r => r.finalAlive);
    expect(counts.filter(c => c !== 1)).toEqual([]);
  });

  test('engine invariants hold in every segment', () => {
    const violations = runs.flatMap(r => r.violations);
    expect([...new Set(violations)].slice(0, 20)).toEqual([]);
  });

  test('summary', () => {
    const lengths = runs.map(r => r.segments.length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const todoLines = runs
      .flatMap(r => r.segments.flatMap(s => s.events))
      .filter(line => line.startsWith('[TODO: No viable'));
    // eslint-disable-next-line no-console
    console.log(
      `Simulated ${GAMES} games of ${TRIBUTES} tributes\n` +
        `  segments per game: avg ${avg.toFixed(1)}, min ${Math.min(...lengths)}, max ${Math.max(...lengths)}\n` +
        `  "[TODO: No viable template]" lines: ${todoLines.length}`
    );
  });
});
