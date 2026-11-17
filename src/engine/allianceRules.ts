import type { Player } from '../types/game.types';

/**
 * Symmetric alliance: a is allied to b iff b.id is in a.alliances and a.id is in b.alliances.
 * Missing back-links are treated as one-way for robustness; dissolution clears everyone alive.
 */
export function areAllied(a: Player, b: Player): boolean {
  if (!a.isAlive || !b.isAlive || a.id === b.id) return false;
  const aToB = a.alliances?.includes(b.id) ?? false;
  const bToA = b.alliances?.includes(a.id) ?? false;
  return aToB && bToA;
}

/**
 * Form symmetric alliances among all players in the given group.
 */
export function formAllianceGroup(group: Player[]): void {
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i]!;
      const b = group[j]!;
      if (!a.alliances) a.alliances = [];
      if (!b.alliances) b.alliances = [];
      if (!a.alliances.includes(b.id)) a.alliances.push(b.id);
      if (!b.alliances.includes(a.id)) b.alliances.push(a.id);
    }
  }
}

/**
 * Count how many distinct alliance components (teams or solo players) exist in the given player subset.
 */
export function countAllianceTeams(subset: Player[]): number {
  const alive = subset.filter(p => p.isAlive);
  if (alive.length <= 1) return alive.length;

  const adj = new Map<string, Set<string>>();
  const idSet = new Set(alive.map(p => p.id));
  for (const p of alive) {
    adj.set(p.id, new Set());
  }
  for (const p of alive) {
    for (const allyId of p.alliances ?? []) {
      if (!idSet.has(allyId)) continue;
      const q = alive.find(pl => pl.id === allyId);
      if (!q) continue;
      if (!(q.alliances?.includes(p.id) ?? false)) continue;
      adj.get(p.id)!.add(allyId);
      adj.get(allyId)!.add(p.id);
    }
  }

  const visited = new Set<string>();
  let compCount = 0;
  for (const p of alive) {
    if (visited.has(p.id)) continue;
    compCount++;
    const stack = [p.id];
    visited.add(p.id);
    while (stack.length) {
      const u = stack.pop()!;
      for (const v of adj.get(u) ?? []) {
        if (!visited.has(v)) {
          visited.add(v);
          stack.push(v);
        }
      }
    }
  }
  return compCount;
}

/**
 * When every surviving tribute is in one alliance component (and at least 2 remain),
 * alliances are broken so they can target each other.
 */
export function dissolveAlliancesWhenNoOutsiders(players: Player[]): boolean {
  const alive = players.filter(p => p.isAlive);
  if (alive.length < 2) return false;

  const compCount = countAllianceTeams(alive);
  const idSet = new Set(alive.map(p => p.id));
  const anyAllyEdge = alive.some(p =>
    (p.alliances ?? []).some(allyId => {
      if (!idSet.has(allyId)) return false;
      const q = alive.find(pl => pl.id === allyId);
      return !!q && (q.alliances?.includes(p.id) ?? false);
    })
  );

  if (compCount === 1 && anyAllyEdge) {
    for (const p of alive) {
      p.alliances = [];
    }
    return true;
  }

  return false;
}

export function playersShareAllianceBlock(players: Player[], ids: string[]): boolean {
  const list = ids
    .map(id => players.find(p => p.id === id))
    .filter((p): p is Player => !!p && p.isAlive);
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (areAllied(list[i]!, list[j]!)) return true;
    }
  }
  return false;
}

/**
 * Returns true if every pair of players in `group` is mutually allied.
 */
export function areAllPlayersAllied(group: Player[]): boolean {
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      if (!areAllied(group[i]!, group[j]!)) return false;
    }
  }
  return true;
}
