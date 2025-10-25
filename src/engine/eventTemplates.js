export const eventTemplates = {
    cornucopia: {
        kills: [
            "{killer} grabs a {weapon} and kills {victim}",
            "{killer} strangles {victim} with bare hands",
            "{killer} snaps {victim}'s neck",
            "{killer} and {victim} fight for a bag. {killer} wins and kills {victim}",
            "{killer} throws a knife into {victim}'s chest",
            "{killer} bludgeons {victim} with a rock",
            "{killer} pushes {victim} into another tribute's weapon",
            "{killer} breaks {victim}'s skull against the Cornucopia",
            "{killer} shoots an arrow into {victim}'s back as they flee",
            "{killer} tackles {victim} and finishes them with a {weapon}"
        ],
        escapes: [
            "{player} runs away from the Cornucopia empty-handed",
            "{player} grabs a {item} and flees into the forest",
            "{player} hides behind the Cornucopia until others leave",
            "{player} barely escapes the bloodbath with minor injuries",
            "{player} sprints away without looking back",
            "{player} manages to avoid the chaos entirely",
            "{player} snatches supplies while others are distracted",
            "{player} dives into nearby bushes with stolen gear"
        ],
        teamwork: [
            "{player1} and {player2} grab supplies together and escape",
            "{player1} helps {player2} escape the bloodbath",
            "{player1} and {player2} team up against other tributes",
            "{player1} covers {player2} while they gather supplies"
        ],
        supplies: [
            "{player} finds a backpack full of camping supplies",
            "{player} grabs multiple water bottles",
            "{player} secures a {weapon} from the Cornucopia",
            "{player} takes medicine and bandages",
            "{player} collects a sleeping bag and dried food"
        ],
        item_events: [
            "{player} uses their rope to climb to safety",
            "{player} starts a fire with their matches",
            "{player} treats their wounds with medicine",
            "{player} shares food with an ally",
            "{player} uses their backpack as shelter",
            "{player} sets a trap with their rope",
            "{player} uses their sleeping bag for warmth",
            "{player} creates a makeshift weapon from rope and sticks"
        ],
        item_exhaustion: [
            "{player} uses their last match to start a fire",
            "{player} breaks their weapon in combat",
            "{player} exhausts their medicine supply",
            "{player} uses up their rope for shelter",
            "{player} consumes their last food",
            "{player} runs out of water"
        ],
        looting: [
            "{killer} searches {victim}'s body and finds useful items",
            "{killer} takes {victim}'s weapons and supplies",
            "{killer} loots {victim}'s backpack for valuable gear",
            "{killer} strips {victim} of their equipment",
            "{killer} searches {victim}'s belongings for anything useful"
        ]
    },

    day: {
        combat_kills: [
            "{killer} tracks down and kills {victim}",
            "{killer} shoots {victim} with an arrow",
            "{killer} pushes {victim} off a cliff",
            "{killer} stabs {victim} during a struggle",
            "{killer} drowns {victim} in a river",
            "{killer} sets a trap that kills {victim}",
            "{killer} poisons {victim}'s water supply",
            "{killer} crushes {victim} with a falling log",
            "{killer} ambushes {victim} near the water source",
            "{killer} hunts down {victim} and kills them with a {weapon}",
            "{killer} beheads {victim} with an axe"
        ],
        accidental_deaths: [
            "{player} eats poisonous berries and dies slowly",
            "{player} falls from a tree while climbing for food",
            "{player} dies from an infected wound",
            "{player} steps on a landmine",
            "{player} gets caught in their own trap",
            "{player} dies of dehydration",
            "{player} is killed by tracker jackers",
            "{player} falls into a pit of spikes",
            "{player} drowns trying to cross a rapid river",
            "{player} dies from eating contaminated food"
        ],
        survival_positive: [
            "{player} finds a clean water source",
            "{player} successfully hunts a rabbit",
            "{player} discovers a cave for shelter",
            "{player} treats their wounds with medicinal plants",
            "{player} finds a backpack with supplies",
            "{player} catches fish in a stream",
            "{player} builds a fire to stay warm",
            "{player} creates a weapon from sticks and stones",
            "{player} discovers edible roots and berries",
            "{player} finds a sponsor gift with food and medicine"
        ],
        survival_neutral: [
            "{player} explores the eastern part of the arena",
            "{player} practices throwing knives",
            "{player} stays hidden in the trees",
            "{player} searches for other tributes",
            "{player} follows a river downstream",
            "{player} sets up camp for the night",
            "{player} camouflages themselves with mud and leaves",
            "{player} scouts the area from a high vantage point",
            "{player} travels north looking for supplies",
            "{player} rests and recovers strength"
        ],
        alliances: [
            "{player1} and {player2} share their food",
            "{player1} and {player2} decide to work together",
            "{player1} tends to {player2}'s wounds",
            "{player1} and {player2} hunt together",
            "{player1} gives {player2} extra water",
            "{player1} and {player2} make camp together"
        ],
        district_alliances: [
            "{player1} and {player2} recognize each other from District {district} and decide to stick together",
            "{player1} and {player2} bond over their shared District {district} background",
            "{player1} and {player2} form an alliance, united by their District {district} heritage",
            "{player1} and {player2} find comfort in their shared District {district} origins",
            "{player1} and {player2} team up, remembering their District {district} training together",
            "{player1} and {player2} form a District {district} alliance for mutual protection"
        ],
        alliance_hunting: [
            "The alliance hunts for other tributes together",
            "The alliance scouts the area for potential targets",
            "The alliance sets up an ambush for unsuspecting tributes",
            "The alliance coordinates a search pattern to find enemies",
            "The alliance plans their next move against remaining tributes",
            "The alliance tracks down a lone tribute",
            "The alliance sets traps to catch other tributes"
        ],
        alliance_combat: [
            "The alliance engages in combat with another group",
            "The alliance fights against a rival alliance",
            "The alliance launches a coordinated attack",
            "The alliance defends their territory from intruders",
            "The alliance battles for control of resources",
            "The alliance fights to eliminate competition",
            "The alliance engages in a fierce group battle"
        ],
        alliance_victory: [
            "The alliance successfully eliminates their targets",
            "The alliance claims victory in the battle",
            "The alliance secures their position",
            "The alliance gains valuable supplies from their victory",
            "The alliance strengthens their bond through shared combat",
            "The alliance celebrates their successful hunt",
            "The alliance consolidates their power"
        ],
        courage_events: [
            "{player} boldly hunts for other tributes",
            "{player} confronts a dangerous situation head-on",
            "{player} takes a calculated risk to gain supplies",
            "{player} stands their ground against threats"
        ],
        cowardice_events: [
            "{player} hides in the bushes, too scared to move",
            "{player} flees at the first sign of danger",
            "{player} cowers behind cover, paralyzed with fear",
            "{player} avoids all confrontation"
        ],
        mental_breakdown: [
            "{player} has a mental breakdown and makes poor decisions",
            "{player} becomes paranoid and attacks shadows",
            "{player} loses focus and stumbles into danger",
            "{player} starts talking to themselves"
        ]
    },

    night: {
        stealth_kills: [
            "{killer} slits {victim}'s throat while they sleep",
            "{killer} quietly strangles {victim} in the darkness",
            "{killer} smothers {victim} with their own sleeping bag",
            "{killer} pushes {victim} into the campfire",
            "{killer} silently stabs {victim} in their sleep",
            "{killer} sneaks up on {victim} and breaks their neck"
        ],
        exposure_deaths: [
            "{player} freezes to death in the cold",
            "{player} dies from untreated injuries",
            "{player} succumbs to infection",
            "{player} dies in their sleep from exhaustion",
            "{player} dies from blood loss"
        ],
        mental_deaths: [
            "{player} loses their sanity and walks into the wilderness, never to return",
            "{player} commits suicide unable to continue",
            "{player} gives up and refuses to eat or drink",
            "{player} screams into the night and attracts predators"
        ],
        survival_night: [
            "{player} tends to their injuries",
            "{player} keeps watch all night",
            "{player} finds warmth near a steam vent",
            "{player} quietly sharpens their weapon",
            "{player} starts a small fire for warmth",
            "{player} finds shelter under a rock overhang"
        ],
        emotional: [
            "{player} cries thinking of home",
            "{player} has nightmares about the games",
            "{player} quietly sings to stay calm",
            "{player} talks to themselves to stay sane",
            "{player} prays for survival",
            "{player} counts stars to stay awake",
            "{player} whispers encouragement to themselves",
            "{player} tries to remember their family's faces"
        ],
        betrayals: [
            "{killer} betrays their alliance and kills {victim}",
            "{killer} poisons {victim} after gaining their trust",
            "{killer} leads {victim} into a trap",
            "{killer} waits until {victim} falls asleep then attacks"
        ],
        suicide_attempts: [
            "{player} considers ending it all but finds the strength to continue",
            "{player} contemplates suicide but is interrupted by sounds",
            "{player} nearly gives up but remembers their family",
            "{player} fights off suicidal thoughts"
        ],
        gear_survival: [
            "{player} uses their sleeping bag to stay warm",
            "{player} finds shelter with their backpack",
            "{player} uses medicine to treat their wounds",
            "{player} starts a fire with their matches"
        ],
        gear_failure: [
            "{player} shivers without proper shelter",
            "{player} suffers from untreated wounds",
            "{player} struggles to stay warm",
            "{player} becomes weak from lack of supplies"
        ]
    },

    special_events: {
        environmental: [
            "A wildfire forces tributes to flee to the lake",
            "A flood washes through the lowlands",
            "Poisonous fog rolls in from the mountains",
            "An avalanche buries part of the arena",
            "A thunderstorm causes massive flooding",
            "Extreme heat wave makes finding water critical",
            "A blizzard freezes the northern section"
        ],
        gamemaker: [
            "The Gamemakers announce a feast at the Cornucopia",
            "Mutant wolves are released into the arena",
            "The Gamemakers drain all water sources except one",
            "Sponsor gifts fall from the sky",
            "The arena begins to shrink, forcing tributes together",
            "Tracker jackers are released near the lake",
            "The Gamemakers create an artificial earthquake"
        ]
    }
};

export const weapons = [
    'sword', 'knife', 'spear', 'bow', 'axe', 'mace',
    'trident', 'dagger', 'sickle', 'machete', 'club'
];

export const items = [
    'backpack', 'rope', 'medicine', 'food', 'water',
    'matches', 'sleeping bag', 'bandages', 'iodine', 'night-vision glasses'
];

// Helper function to shuffle array
export function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}