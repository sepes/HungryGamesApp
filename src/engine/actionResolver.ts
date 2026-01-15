import type { Action, ResolvedAction, Arena } from './types';
import type { Player } from '../types/game.types';
import { getActionsForPhase } from './actions';

export class ActionResolver {
  private actionWeights: Map<string, number>;
  private arena: Arena;

  constructor(arena: Arena) {
    this.arena = arena;
    this.actionWeights = new Map();
    this.initializeWeights();
  }

  /**
   * Initialize all action weights to 1.0
   */
  private initializeWeights(): void {
    // Get all actions from all phases
    const allPhases = ['prologue', 'cornucopia', 'day', 'night', 'any'];
    const allActions: Action[] = [];
    
    for (const phase of allPhases) {
      allActions.push(...getActionsForPhase(phase));
    }

    // Initialize weights
    for (const action of allActions) {
      this.actionWeights.set(action.id, 1.0);
    }
  }

  /**
   * Reset all weights to 1.0 (called after each day cycle)
   */
  resetWeights(): void {
    for (const [actionId] of this.actionWeights) {
      this.actionWeights.set(actionId, 1.0);
    }
  }

  /**
   * Get valid actions for phase and terrain
   */
  private getValidActions(phase: string): Action[] {
    const phaseActions = getActionsForPhase(phase);
    
    return phaseActions.filter(action => {
      // Check terrain requirements
      if (action.terrainRequired && action.terrainRequired.length > 0) {
        return action.terrainRequired.every(terrain => 
          this.arena.terrains.has(terrain)
        );
      }
      return true;
    });
  }

  /**
   * Select action using weighted random
   */
  selectAction(phase: string, availablePlayers: Player[]): ResolvedAction | null {
    const validActions = this.getValidActions(phase);
    
    if (validActions.length === 0) {
      return null;
    }

    // Calculate total weight
    let totalWeight = 0;
    for (const action of validActions) {
      const weight = this.actionWeights.get(action.id) || 1.0;
      totalWeight += weight;
    }

    if (totalWeight === 0) {
      // Fallback to uniform random
      const action = validActions[Math.floor(Math.random() * validActions.length)];
      if (!action) return null;
      return this.resolveAction(action, availablePlayers);
    }

    // Weighted random selection
    let random = Math.random() * totalWeight;
    for (const action of validActions) {
      const weight = this.actionWeights.get(action.id) || 1.0;
      random -= weight;
      if (random <= 0) {
        // Decay weight after use
        this.decayWeight(action.id);
        return this.resolveAction(action, availablePlayers);
      }
    }

    // Fallback
    const action = validActions[validActions.length - 1];
    if (!action) return null;
    this.decayWeight(action.id);
    return this.resolveAction(action, availablePlayers);
  }

  /**
   * Decay action weight after use (70% reduction)
   */
  private decayWeight(actionId: string): void {
    const currentWeight = this.actionWeights.get(actionId) || 1.0;
    this.actionWeights.set(actionId, currentWeight * 0.3);
  }

  /**
   * Resolve action with participants
   */
  private resolveAction(action: Action, availablePlayers: Player[]): ResolvedAction {
    const resolved: ResolvedAction = {
      action,
      participants: []
    };

    // Shuffle available players
    const shuffled = [...availablePlayers].sort(() => Math.random() - 0.5);

    switch (action.type) {
      case 'solo':
        if (shuffled.length > 0) {
          resolved.participants = [shuffled[0]!];
        }
        break;

      case 'versus':
        if (shuffled.length >= 2) {
          resolved.killers = [shuffled[0]!];
          resolved.victims = [shuffled[1]!];
          resolved.participants = [shuffled[0]!, shuffled[1]!];
        } else if (shuffled.length === 1) {
          // Fallback to solo if not enough players
          resolved.participants = [shuffled[0]!];
        }
        break;

      case 'group':
        // Take up to 3 players
        resolved.participants = shuffled.slice(0, Math.min(3, shuffled.length));
        break;
    }

    return resolved;
  }

  /**
   * Get weight for an action (for debugging)
   */
  getWeight(actionId: string): number {
    return this.actionWeights.get(actionId) || 1.0;
  }
}
