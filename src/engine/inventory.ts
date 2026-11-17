import type { Player } from '../types/game.types';

/**
 * Check if player has a specific weapon/tool in their inventory
 */
export function hasItem(player: Player, itemName: string): boolean {
  if (!player.inventory) return false;
  const target = itemName.trim().toLowerCase();
  return player.inventory.some(item => item.name.toLowerCase() === target);
}

/**
 * Add a weapon/tool to player's inventory if not already carried
 */
export function addItemToInventory(player: Player, itemName: string): boolean {
  const normalized = itemName.trim().toLowerCase();
  if (!normalized) return false;

  if (!player.inventory) {
    player.inventory = [];
  }

  if (hasItem(player, normalized)) {
    return true;
  }

  player.inventory.push({ name: normalized });
  return true;
}
