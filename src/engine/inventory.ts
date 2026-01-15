import type { Player, Item } from '../types/game.types';

// Item Categories
export const WEAPONS = [
  'sword', 'knife', 'spear', 'bow', 'axe', 'mace', 
  'trident', 'dagger', 'sickle', 'machete', 'club'
];

export const TOOLS = [
  'backpack', 'sleeping bag', 'night-vision glasses', 'rope'
];

export const CONSUMABLES = [
  'medicine', 'bandages', 'iodine', 'matches', 'food', 'water'
];

// Consumable max uses
const CONSUMABLE_MAX_USES: Record<string, number> = {
  'medicine': 3,
  'bandages': 3,
  'iodine': 3,
  'matches': 5,
  'food': 1,
  'water': 1
};

/**
 * Check if player has a weapon
 */
export function hasWeapon(player: Player): boolean {
  if (!player.inventory) return false;
  return player.inventory.some(item => WEAPONS.includes(item.name));
}

/**
 * Check if player has specific gear type
 */
export function hasGear(player: Player, type: string): boolean {
  if (!player.inventory) return false;
  
  const gearTypes: Record<string, string[]> = {
    'shelter': ['backpack', 'sleeping bag'],
    'medicine': ['medicine', 'bandages', 'iodine'],
    'fire': ['matches'],
    'survival': ['food', 'water', 'rope'],
    'night_vision': ['night-vision glasses']
  };

  const items = gearTypes[type] || [];
  return player.inventory.some(item => items.includes(item.name));
}

/**
 * Check if player can add item to inventory (capacity limits)
 */
export function canAddItem(player: Player, item: Item): boolean {
  const inventory = player.inventory || [];
  const hasBackpack = inventory.some(invItem => invItem.name === 'backpack');

  if (WEAPONS.includes(item.name)) {
    // Max 2 weapons
    const currentWeapons = inventory.filter(invItem => WEAPONS.includes(invItem.name));
    return currentWeapons.length < 2;
  } else if (TOOLS.includes(item.name)) {
    if (hasBackpack) {
      // Backpack can hold unlimited tools
      return true;
    } else {
      // Max 1 tool without backpack
      const currentTools = inventory.filter(invItem => TOOLS.includes(invItem.name));
      return currentTools.length < 1;
    }
  } else {
    // Consumables - unlimited
    return true;
  }
}

/**
 * Add item to player inventory
 */
export function addItemToInventory(player: Player, itemName: string, uses: number = 1): boolean {
  // Check inventory limits first
  const tempItem: Item = { name: itemName, uses: uses };
  if (!canAddItem(player, tempItem)) {
    return false;
  }

  if (!player.inventory) {
    player.inventory = [];
  }

  // Check if item already exists
  const existingItem = player.inventory.find(item => item.name === itemName);
  if (existingItem) {
    if (CONSUMABLES.includes(itemName)) {
      // For consumables, add to uses up to max
      const maxUses = CONSUMABLE_MAX_USES[itemName] || 1;
      existingItem.uses = Math.min((existingItem.uses || 0) + uses, maxUses);
    }
    // Weapons and tools are permanent, don't stack
    return true;
  }

  // Determine max uses based on item type
  let maxUses = 1;
  if (WEAPONS.includes(itemName)) {
    maxUses = 100; // Infinite for weapons
  } else if (TOOLS.includes(itemName)) {
    maxUses = 100; // Permanent tools
  } else if (CONSUMABLES.includes(itemName)) {
    maxUses = CONSUMABLE_MAX_USES[itemName] || 1;
  }

  player.inventory.push({
    name: itemName,
    uses: Math.min(uses, maxUses),
    maxUses: maxUses
  });
  return true;
}

/**
 * Consume item (decrement uses, remove if 0)
 * Weapons are never consumed
 */
export function consumeItem(player: Player, itemName: string): boolean {
  if (!player.inventory) return false;
  
  const itemIndex = player.inventory.findIndex(item => item.name === itemName);
  if (itemIndex === -1) return false;

  const item = player.inventory[itemIndex];
  if (!item) return false;

  // Weapons have infinite uses, so don't consume them
  if (WEAPONS.includes(itemName)) {
    return true; // Weapon used but not consumed
  }

  // Tools are permanent
  if (TOOLS.includes(itemName)) {
    return true;
  }

  // Only consumables are depleted
  if (item.uses && item.uses > 0) {
    item.uses--;
  }

  if ((item.uses ?? 0) <= 0) {
    player.inventory.splice(itemIndex, 1);
  }

  return true;
}

/**
 * Loot victim's items to killer
 */
export function lootPlayer(killer: Player, victim: Player): string[] {
  if (!victim.inventory || victim.inventory.length === 0) return [];

  const victimItems = [...victim.inventory];
  const lootedItems: string[] = [];

  for (const item of victimItems) {
    if (canAddItem(killer, item)) {
      addItemToInventory(killer, item.name, item.uses || 1);
      lootedItems.push(item.name);
    }
  }

  return lootedItems;
}

/**
 * Get player kill probability modifier based on items
 */
export function getKillProbabilityModifier(player: Player): number {
  let modifier = 0;

  // Weapon bonus
  if (hasWeapon(player)) modifier += 0.5;

  // Night vision glasses bonus
  if (hasGear(player, 'night_vision')) modifier += 0.3;

  return modifier;
}

/**
 * Get player survival probability modifier based on items
 */
export function getSurvivalProbabilityModifier(player: Player): number {
  let modifier = 0;

  // Gear bonuses
  if (hasGear(player, 'shelter')) modifier += 0.3;
  if (hasGear(player, 'medicine')) modifier += 0.2;
  if (hasGear(player, 'night_vision')) modifier += 0.25;

  return modifier;
}
