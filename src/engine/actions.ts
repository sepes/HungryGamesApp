import type { Action, MajorEvent } from './types';

// Generated from action_templates.xlsx - Actions.csv
const CANNON_TEMPLATES = [
  "Cannon fires"
];

const CANNON_GROUP_TEMPLATES = [
  "{deaths} cannons gets fired"
];

function getRandomCannonTemplate(): string {
  return CANNON_TEMPLATES[Math.floor(Math.random() * CANNON_TEMPLATES.length)]!;
}

function getRandomCannonGroupTemplate(): string {
  return CANNON_GROUP_TEMPLATES[Math.floor(Math.random() * CANNON_GROUP_TEMPLATES.length)]!;
}

export const actionPool: Action[] = [
  {
    id: "alliance_p2",
    type: "group",
    phase: "cornucopia",
    damageDelta: 0,
    templates: [
      "{player} and {player} ran away in the same direction"
    ]
  },
  {
    id: "alliance_p3",
    type: "group",
    phase: "cornucopia",
    damageDelta: 0,
    chanceMultiplier: 0.2,
    templates: [
      "{player}, {player} and {player} ran away together like it was a preplanned alliance"
    ]
  },
  {
    id: "alliance_p4",
    type: "group",
    phase: "cornucopia",
    damageDelta: 0,
    chanceMultiplier: 0.2,
    templates: [
      "{player}, {player}, {player} and {player} gave each others fistpumps before running away"
    ]
  },
  {
    id: "cornucopia_d0",
    type: "solo",
    phase: "cornucopia",
    damageDelta: 0,
    giveItem: "medkit",
    templates: [
      "{player} finds a medkit and runs away from the cornucopia"
    ]
  },
  {
    id: "cornucopia_d60",
    type: "solo",
    phase: "cornucopia",
    damageDelta: 60,
    giveItem: "medkit",
    templates: [
      "{player} finds a medkit but gets stabbed before they get away from the cornucopia"
    ]
  },
  {
    id: "cornucopia_d70",
    type: "versus",
    phase: "cornucopia",
    damageDelta: 70,
    templates: [
      "{killer} took a rock from the ground and threw it towards {victim} hurting them"
    ]
  },
  {
    id: "cornucopia_d80",
    type: "versus",
    phase: "cornucopia",
    damageDelta: 80,
    templates: [
      "{killer} finds a knife but throws it towards {victim} hurting them badly",
      "{killer} lands a direct hit to {victim}'s head with their fists"
    ]
  },
  {
    id: "cornucopia_d100",
    type: "versus",
    phase: "cornucopia",
    damageDelta: 100,
    templates: [
      "{killer} runs towards much smaller tribute {victim} and strangles them until the squirming stops"
    ]
  },
  {
    id: "cornucopia_d100",
    type: "versus",
    phase: "cornucopia",
    damageDelta: 100,
    chanceMultiplier: 2,
    templates: [
      "{victim} tries to struggle out of {killer}'s beating without success"
    ]
  },
  {
    id: "cornucopia_knife_kill",
    type: "versus",
    phase: "cornucopia",
    damageDelta: 100,
    chanceMultiplier: 5,
    requiredItem: "knife",
    templates: [
      "{killer} took their knife and stabs {victim} to death",
      "{killer} stabs {victim} so bad they fall on the ground limb"
    ]
  },
  {
    id: "cornucopia_runaway",
    type: "solo",
    phase: "cornucopia",
    damageDelta: 0,
    chanceMultiplier: 0.2,
    templates: [
      "{player} runs away from the cornucopia"
    ]
  },
  {
    id: "cornucopia_runaway_forest",
    type: "solo",
    phase: "cornucopia",
    terrainRequired: ["forest"],
    damageDelta: 0,
    chanceMultiplier: 0.2,
    templates: [
      "{player} start running to the forest",
      "{player} heads to the forest hoping nobody follows them"
    ]
  },
  {
    id: "cornucopia_solo_knife",
    type: "solo",
    phase: "cornucopia",
    damageDelta: 0,
    chanceMultiplier: 0.5,
    giveItem: "knife",
    templates: [
      "{player} runs towards the cornucopia managing to safely get a knife before running away"
    ]
  },
  {
    id: "cornucopia_solo_knife_hurt",
    type: "solo",
    phase: "cornucopia",
    damageDelta: 10,
    chanceMultiplier: 0.5,
    giveItem: "knife",
    templates: [
      "{player} runs towards the cornucopia but takes a hit before getting a knife and running away"
    ]
  },
  {
    id: "cornucopia_versus_knife",
    type: "versus",
    phase: "cornucopia",
    damageDelta: 100,
    giveItem: "knife",
    templates: [
      "{killer} runs towards the cornucopia takes a knife and stabs {victim} until they stop screaming"
    ]
  },
  {
    id: "cornucopia_versus_knife_tackle",
    type: "versus",
    phase: "cornucopia",
    damageDelta: 10,
    chanceMultiplier: 1.5,
    giveItem: "knife",
    templates: [
      "{killer} tackles {victim} against cornucopia and gets a knife before them",
      "{killer} trips {victim} on the ground while running to the cornucopia and graps a knife ready to use"
    ]
  },
  {
    id: "knife_ambush_d50",
    type: "versus",
    phase: "night",
    damageDelta: 50,
    requiredItem: "knife",
    templates: [
      "{killer} ambushes {victim} at night and slashes them with a knife before running away"
    ]
  },
  {
    id: "knife_ambush_d90",
    type: "versus",
    phase: "night",
    damageDelta: 90,
    requiredItem: "knife",
    templates: [
      "{killer} ambushes {victim} at night and stabs them once with a knife before running away"
    ]
  },
  {
    id: "knife_group_fish",
    type: "group",
    phase: "day",
    terrainRequired: ["river", "lake"],
    damageDelta: -10,
    requiredItem: "knife",
    groupGateAnyParticipant: true,
    templates: [
      "{player}, {player} and {player} caught a fish, prepared it with a knife, and shared it evenly.",
      "{player} and {player} waited eagerly while {player} prepared a fish they caught earlier."
    ]
  },
  {
    id: "knife_solo_play",
    type: "solo",
    phase: "day",
    terrainRequired: ["forest"],
    damageDelta: 2,
    requiredItem: "knife",
    templates: [
      "{player} uses knife to play hand roulette against a tree"
    ]
  },
  {
    id: "medkit_solo",
    type: "solo",
    phase: "any",
    damageDelta: -10,
    chanceMultiplier: 5,
    requiredItem: "medkit",
    templates: [
      "{player} uses medkit to treat their wounds and bruises"
    ]
  },
  {
    id: "solo_day",
    type: "solo",
    phase: "day",
    damageDelta: 0,
    chanceMultiplier: 0.5,
    templates: [
      "{player} pics flowers and think about home",
      "{player} searches food from under the rocks without success"
    ]
  },
  {
    id: "solo_day_hurt_desert",
    type: "solo",
    phase: "day",
    terrainRequired: ["lake"],
    damageDelta: 10,
    templates: [
      "{player} burns their feet on the sun baked sand"
    ]
  },
  {
    id: "solo_day_hurt_forest",
    type: "solo",
    phase: "day",
    terrainRequired: ["forest"],
    damageDelta: 10,
    templates: [
      "{player} climps a tree but hurts themself while grapping a dead branch",
      "{player} runs further into the forest so haistly that they cut themselves on a broken branch"
    ]
  },
  {
    id: "solo_day_hurt_lake",
    type: "solo",
    phase: "day",
    terrainRequired: ["lake"],
    damageDelta: 10,
    templates: [
      "{player} desides to cross the lake for better odds of surviving but the weather is not on their favor"
    ]
  },
  {
    id: "solo_day_knife",
    type: "solo",
    phase: "day",
    damageDelta: 10,
    requiredItem: "knife",
    templates: [
      "{player} makes a small cuts to their hand with a knife"
    ]
  },
  {
    id: "solo_night",
    type: "solo",
    phase: "night",
    damageDelta: 0,
    chanceMultiplier: 0.5,
    templates: [
      "{player} counts stars to fall a sleep",
      "{player} finds a good spot to safely sleep"
    ]
  },
  {
    id: "solo_night_no_shelter",
    type: "solo",
    phase: "night",
    damageDelta: 10,
    templates: [
      "{player} shivers on the ground without a shelter",
      "{player} tries to keep themself warm in the cold night wind"
    ]
  },
  {
    id: "versus",
    type: "versus",
    phase: "any",
    damageDelta: 90,
    templates: [
      "{killer} gives {victim} poisonous berries to eat."
    ]
  },
  {
    id: "versus_day",
    type: "versus",
    phase: "day",
    damageDelta: 20,
    templates: [
      "{victim} finds themself running aimlessly to a poisonous bush while trying to run away from {killer}"
    ]
  },
  {
    id: "versus_day_mountain",
    type: "versus",
    phase: "day",
    terrainRequired: ["mountain"],
    damageDelta: 95,
    templates: [
      "{victim} accidentally runs off a cliff from the mountain while trying to kill {killer}"
    ]
  },
  {
    id: "versus_lethal",
    type: "versus",
    phase: "any",
    damageDelta: 100,
    templates: [
      "{killer} lures {victim} into a cave that turns out to be full of Tracker jackers"
    ]
  },
  {
    id: "versus_night",
    type: "versus",
    phase: "night",
    damageDelta: 60,
    templates: [
      "{killer} finds {victim} from their hiding spot and beats them"
    ]
  },
  {
    id: "versus_severe",
    type: "versus",
    phase: "any",
    damageDelta: 99,
    templates: [
      "{killer} finds a Tracker jackers nest and successfully got them to attack {victim} making them hallusinate their worst fears"
    ]
  }
];

export function getActionsForPhase(phase: string): Action[] {
  return actionPool.filter(action =>
    action.phase === phase ||
    (action.phase === 'any' && (phase === 'day' || phase === 'night'))
  );
}

export function getCannonText(deathCount: number): string {
  if (deathCount <= 0) return "";
  if (deathCount === 1) {
    return getRandomCannonTemplate();
  }
  return getRandomCannonGroupTemplate().replace('{deaths}', String(deathCount));
}

export function getCannonGroupText(deathCount: number): string {
  if (deathCount <= 0) return "";
  return getRandomCannonGroupTemplate().replace('{deaths}', String(deathCount));
}

export const majorEventPool: MajorEvent[] = [];
