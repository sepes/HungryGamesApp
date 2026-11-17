import type { Player, SimulationPhase } from '../types/game.types';
import type { Action, Arena } from './types';
import {
  areAllied,
  areAllPlayersAllied,
  dissolveAlliancesWhenNoOutsiders,
  formAllianceGroup,
  playersShareAllianceBlock
} from './allianceRules';
import { getActionsForPhase, getCannonText } from './actions';
import { hasItem, addItemToInventory } from './inventory';
import { markPlayerName } from '../utils/eventText';

export interface DamageBeatContext {
  phase: SimulationPhase;
  arena: Arena;
  players: Player[];
  day: number;
  /** Increments for each death (1 = first fallen this game) */
  getNextPlace: () => number;
}

function clampDamage(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function weightedOrderActions(actions: Action[]): Action[] {
  const remaining = [...actions];
  const ordered: Action[] = [];

  while (remaining.length > 0) {
    let totalWeight = 0;
    for (const action of remaining) {
      totalWeight += Math.max(0, action.chanceMultiplier ?? 1);
    }

    if (totalWeight <= 0) {
      ordered.push(...shuffleInPlace(remaining));
      break;
    }

    let r = Math.random() * totalWeight;
    let pickedIndex = remaining.length - 1;
    for (let i = 0; i < remaining.length; i++) {
      r -= Math.max(0, remaining[i]!.chanceMultiplier ?? 1);
      if (r <= 0) {
        pickedIndex = i;
        break;
      }
    }

    ordered.push(remaining[pickedIndex]!);
    remaining.splice(pickedIndex, 1);
  }

  return ordered;
}

function pickTemplate(templates: string[]): string {
  return templates[randomInt(templates.length)]!;
}

function passesTemplateGates(action: Action, actors: Player[]): boolean {
  const req = action.requiredItem;
  if (!req) return true;
  if (action.type === 'group' && action.groupGateAnyParticipant) {
    return actors.some(p => hasItem(p, req));
  }
  return actors.every(p => hasItem(p, req));
}

function lacksAcquisition(action: Action, recipients: Player[]): boolean {
  const item = action.giveItem;
  if (!item) return true;
  return recipients.every(p => !hasItem(p, item));
}

function fillTemplate(
  template: string,
  slots: Record<string, string>
): string {
  let s = template;
  for (const [key, val] of Object.entries(slots)) {
    const highlighted = markPlayerName(val);
    s = s.split(`{${key}}`).join(highlighted);
  }
  return s;
}

function sortDeathsByOverflow(
  before: Map<string, number>,
  after: Map<string, number>,
  players: Player[]
): Player[] {
  const dead: Player[] = [];
  const aliveIds = new Set(players.filter(p => p.isAlive).map(p => p.id));
  for (const p of players) {
    if (aliveIds.has(p.id) && (after.get(p.id) ?? 0) >= 100) {
      dead.push(p);
    }
  }
  dead.sort((a, b) => {
    const ob = (after.get(b.id) ?? 0) - (before.get(b.id) ?? 0);
    const oa = (after.get(a.id) ?? 0) - (before.get(a.id) ?? 0);
    return ob - oa;
  });
  return dead;
}

interface ResolvedBeat {
  lines: string[];
  died: Player[];
  participants: Player[];
  actionType: Action['type'];
}

function tryResolveActionForAnchor(
  action: Action,
  anchor: Player,
  available: Player[],
  ctx: DamageBeatContext
): ResolvedBeat | null {
  const others = shuffleInPlace(available.filter(p => p.id !== anchor.id));

  if (action.type === 'solo') {
    if (!passesTemplateGates(action, [anchor])) return null;
    if (!lacksAcquisition(action, [anchor])) return null;
    const tmpl = pickTemplate(action.templates);
    const text = fillTemplate(tmpl, { player: anchor.name });
    const res = applyDamageFlat(action, [anchor], text, null, ctx);
    return { ...res, participants: [anchor], actionType: 'solo' };
  }

  if (action.type === 'versus') {
    if (passesTemplateGates(action, [anchor]) && lacksAcquisition(action, [anchor])) {
      for (const victim of others) {
        if (areAllied(anchor, victim)) continue;
        const tmpl = pickTemplate(action.templates);
        const text = fillTemplate(tmpl, { killer: anchor.name, victim: victim.name });
        const res = applyDamageFlat(action, [victim], text, anchor, ctx);
        return { ...res, participants: [anchor, victim], actionType: 'versus' };
      }
    }
    for (const killer of others) {
      if (areAllied(killer, anchor)) continue;
      if (!passesTemplateGates(action, [killer])) continue;
      if (!lacksAcquisition(action, [killer])) continue;
      const tmpl = pickTemplate(action.templates);
      const text = fillTemplate(tmpl, { killer: killer.name, victim: anchor.name });
      const res = applyDamageFlat(action, [anchor], text, killer, ctx);
      return { ...res, participants: [killer, anchor], actionType: 'versus' };
    }
    return null;
  }

  if (action.type === 'group') {
    const sampleTemplate = action.templates[0] || '';
    const playerCount = (sampleTemplate.match(/\{player\d*\}/g) || []).length;
    const needed = Math.max(2, playerCount);

    const isAllianceFormation = action.id.startsWith('alliance');

    if (isAllianceFormation) {
      if (available.length < needed) return null;

      for (let attempt = 0; attempt < 24; attempt++) {
        const perm = shuffleInPlace([...others]);
        const group = shuffleInPlace([anchor, ...perm.slice(0, needed - 1)]);
        const ids = group.map(p => p.id);
        if (playersShareAllianceBlock(ctx.players, ids)) continue;
        if (!passesTemplateGates(action, group)) continue;
        if (!lacksAcquisition(action, group)) continue;

        const tmpl = pickTemplate(action.templates);
        const slots: Record<string, string> = {};
        group.forEach((p, idx) => {
          slots[`player${idx + 1}`] = p.name;
        });
        let text = fillTemplate(tmpl, slots);
        for (const p of group) {
          text = text.replace('{player}', markPlayerName(p.name));
        }
        const res = applyDamageFlat(action, group, text, null, ctx);
        formAllianceGroup(group.filter(p => p.isAlive));
        return { ...res, participants: group, actionType: 'group' };
      }
      return null;
    }

    // Non-alliance group actions require an existing alliance of sufficient size among available players
    const availableAllies = others.filter(p => areAllied(anchor, p));
    if (availableAllies.length < needed - 1) return null;

    for (let attempt = 0; attempt < 24; attempt++) {
      const perm = shuffleInPlace([...availableAllies]);
      const group = shuffleInPlace([anchor, ...perm.slice(0, needed - 1)]);
      if (!areAllPlayersAllied(group)) continue;
      if (!passesTemplateGates(action, group)) continue;
      if (!lacksAcquisition(action, group)) continue;

      const tmpl = pickTemplate(action.templates);
      const slots: Record<string, string> = {};
      group.forEach((p, idx) => {
        slots[`player${idx + 1}`] = p.name;
      });
      let text = fillTemplate(tmpl, slots);
      for (const p of group) {
        text = text.replace('{player}', markPlayerName(p.name));
      }
      const res = applyDamageFlat(action, group, text, null, ctx);
      return { ...res, participants: group, actionType: 'group' };
    }
  }

  return null;
}

function applyDamageFlat(
  action: Action,
  targets: Player[],
  narrativeLine: string,
  killer: Player | null,
  ctx: DamageBeatContext
): { lines: string[]; died: Player[] } {
  const delta = action.damageDelta;
  const lines: string[] = [narrativeLine];

  const before = new Map<string, number>();
  const after = new Map<string, number>();

  for (const p of ctx.players) {
    before.set(p.id, p.damage ?? 0);
  }

  for (const t of targets) {
    if (!t.isAlive) continue;
    const cur = t.damage ?? 0;
    const next = clampDamage(cur + delta);
    t.damage = next;
    after.set(t.id, next);
  }

  for (const p of ctx.players) {
    if (!after.has(p.id)) {
      after.set(p.id, p.damage ?? 0);
    }
  }

  // Give items before processing deaths
  if (action.giveItem) {
    const recipients = action.type === 'versus' && killer ? [killer] : targets;
    for (const recipient of recipients) {
      if (recipient.isAlive) {
        addItemToInventory(recipient, action.giveItem);
      }
    }
  }

  const overflowDeathOrder = sortDeathsByOverflow(before, after, ctx.players);
  const diedNow: Player[] = [];

  for (const p of overflowDeathOrder) {
    if (!p.isAlive) continue;
    if ((p.damage ?? 0) < 100) continue;

    p.isAlive = false;
    p.diedInPhase = ctx.phase;
    p.diedOnDay = ctx.day;
    p.deathPlace = ctx.getNextPlace();

    if (killer && killer.isAlive && killer.id !== p.id && action.type === 'versus') {
      killer.kills = (killer.kills ?? 0) + 1;
    }

    diedNow.push(p);
  }

  if (diedNow.length > 0 && ctx.phase !== 'cornucopia') {
    const cannonLine = getCannonText(diedNow.length);
    if (cannonLine) {
      lines.push(cannonLine);
    }
  }

  return { lines, died: diedNow };
}

function terrainOk(action: Action, arena: Arena): boolean {
  if (!action.terrainRequired?.length) return true;
  return action.terrainRequired.some(t => arena.terrains.has(t));
}

function runOneTouchPass(
  subset: Player[],
  pool: Action[],
  ctx: DamageBeatContext,
  winnerCount: number
): { lines: string[]; died: Player[]; stayedInCornucopia: Player[] } {
  const unactedIds = new Set(subset.filter(p => p.isAlive).map(p => p.id));
  const blocks: string[][] = [];
  const died: Player[] = [];
  const stayedIds = new Set<string>();

  while (unactedIds.size > 0) {
    dissolveAlliancesWhenNoOutsiders(ctx.players);

    const aliveAll = ctx.players.filter(p => p.isAlive);
    if (aliveAll.length <= winnerCount) break;

    const unactedAlive = subset.filter(p => p.isAlive && unactedIds.has(p.id));
    if (unactedAlive.length === 0) break;

    const anchor = unactedAlive[randomInt(unactedAlive.length)]!;
    let resolved: ResolvedBeat | null = null;

    const orderedPool = weightedOrderActions(pool);
    for (const action of orderedPool) {
      resolved = tryResolveActionForAnchor(action, anchor, unactedAlive, ctx);
      if (resolved) break;
    }

    if (resolved) {
      if (resolved.lines.length > 0) {
        blocks.push(resolved.lines);
      }
      died.push(...resolved.died);
      if (resolved.actionType === 'versus') {
        for (const participant of resolved.participants) {
          if (participant.isAlive) {
            stayedIds.add(participant.id);
          }
        }
      }
      for (const participant of resolved.participants) {
        unactedIds.delete(participant.id);
      }
      for (const deadPlayer of resolved.died) {
        unactedIds.delete(deadPlayer.id);
        stayedIds.delete(deadPlayer.id);
      }
    } else {
      blocks.push([`[TODO: No viable ${ctx.phase} template for ${markPlayerName(anchor.name)}]`]);
      unactedIds.delete(anchor.id);
    }
  }

  const lines: string[] = [];
  for (const block of shuffleInPlace(blocks)) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push(...block);
  }

  const stayedInCornucopia = ctx.players.filter(p => p.isAlive && stayedIds.has(p.id));
  return { lines, died, stayedInCornucopia };
}

/**
 * Runs one round of Cornucopia for the given subset of players still at the Cornucopia.
 */
export function runCornucopiaRound(
  inCornucopia: Player[],
  ctx: DamageBeatContext,
  winnerCount: number = 1
): { lines: string[]; died: Player[]; stayedInCornucopia: Player[] } {
  const pool = getActionsForPhase('cornucopia').filter(a => terrainOk(a, ctx.arena));
  return runOneTouchPass(inCornucopia, pool, ctx, winnerCount);
}

/**
 * Runs actions until every living tribute has been touched once in this phase (day/night).
 */
export function runPhaseDamageBeats(
  ctx: DamageBeatContext,
  winnerCount: number = 1
): { lines: string[]; died: Player[] } {
  const phaseKey =
    ctx.phase === 'cornucopia' ? 'cornucopia' : ctx.phase === 'day' ? 'day' : ctx.phase === 'night' ? 'night' : 'any';
  const pool = getActionsForPhase(phaseKey).filter(a => terrainOk(a, ctx.arena));

  const pass = runOneTouchPass(ctx.players.filter(p => p.isAlive), pool, ctx, winnerCount);
  return { lines: pass.lines, died: pass.died };
}
