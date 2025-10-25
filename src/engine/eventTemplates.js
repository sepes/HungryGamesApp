export const eventTemplates = {
    cornucopia: {
        // Weapon-specific kills
        sword_kills: [
            "{killer} swings their sword with deadly precision, cutting down {victim}",
            "{killer} thrusts their sword through {victim}'s chest in a brutal strike",
            "{killer} decapitates {victim} with a swift sword stroke",
            "{killer} slashes {victim} across the throat with their blade",
            "{killer} impales {victim} on their sword as they charge forward"
        ],
        knife_kills: [
            "{killer} stabs {victim} repeatedly with their knife in a frenzied attack",
            "{killer} slits {victim}'s throat with a quick knife stroke",
            "{killer} plunges their knife into {victim}'s heart",
            "{killer} throws their knife with deadly accuracy, hitting {victim} in the chest",
            "{killer} slashes {victim} across the face with their blade"
        ],
        bow_kills: [
            "{killer} draws their bow and shoots {victim} through the heart",
            "{killer} fires an arrow that pierces {victim}'s skull",
            "{killer} shoots {victim} in the back as they try to flee",
            "{killer} aims carefully and sends an arrow through {victim}'s throat",
            "{killer} fires multiple arrows, one finding {victim}'s vital organs"
        ],
        spear_kills: [
            "{killer} thrusts their spear through {victim}'s abdomen",
            "{killer} throws their spear with deadly force, impaling {victim}",
            "{killer} stabs {victim} in the chest with their spear",
            "{killer} uses their spear to pin {victim} against the Cornucopia",
            "{killer} strikes {victim} with a powerful spear thrust"
        ],
        axe_kills: [
            "{killer} swings their axe with brutal force, cleaving {victim} in half",
            "{killer} buries their axe in {victim}'s skull",
            "{killer} chops {victim} down with a devastating axe blow",
            "{killer} splits {victim}'s head open with their axe",
            "{killer} hacks at {victim} with their axe until they fall"
        ],
        bare_hands_kills: [
            "{killer} strangles {victim} with their bare hands, squeezing the life from them",
            "{killer} snaps {victim}'s neck with a quick, brutal twist",
            "{killer} beats {victim} to death with their fists",
            "{killer} crushes {victim}'s windpipe with their hands",
            "{killer} wrestles {victim} to the ground and chokes them out"
        ],
        improvised_kills: [
            "{killer} bludgeons {victim} to death with a rock",
            "{killer} strangles {victim} with a piece of rope",
            "{killer} beats {victim} with a heavy branch",
            "{killer} crushes {victim}'s skull with a large stone",
            "{killer} drowns {victim} in a nearby puddle"
        ],
        // Generic kills for fallback
        kills: [
            "{killer} and {victim} fight. {killer} wins by kicking {victim} in the head, killing them instantly",
            "{killer} pushes {victim} into another tribute's weapon",
            "{killer} breaks {victim}'s skull against the Cornucopia",
            "{killer} runs to {victim} tackles them and strangles to death"
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
        // Specific item usage events
        rope_usage: [
            "{player} uses their rope to climb to safety in the trees",
            "{player} sets a trap with their rope to catch other tributes",
            "{player} uses their rope to create a makeshift shelter",
            "{player} ties their rope to a tree branch for climbing",
            "{player} uses their rope to secure their camp"
        ],
        matches_usage: [
            "{player} starts a fire with their matches to stay warm",
            "{player} uses their matches to light a signal fire",
            "{player} starts a fire with their matches to cook food",
            "{player} uses their matches to create a torch for light",
            "{player} starts a fire with their matches to ward off predators"
        ],
        medicine_usage: [
            "{player} treats their wounds with medicine to prevent infection",
            "{player} uses their medicine to heal their injuries",
            "{player} applies medicine to their cuts and bruises",
            "{player} uses their medicine to treat a fever",
            "{player} uses their medicine to heal their wounds"
        ],
        food_usage: [
            "{player} consumes their food to regain strength",
            "{player} eats their food to stave off hunger",
            "{player} carefully rations their food for the long haul",
            "{player} eats their food to maintain their energy",
            "{player} devours their food ravenously, their hunger finally satisfied"
        ],
        water_usage: [
            "{player} drinks their water to quench their thirst",
            "{player} carefully conserves their water supply",
            "{player} uses their water to clean their wounds",
            "{player} drinks their water to stay hydrated",
            "{player} gulps down their water desperately, their parched throat finally relieved"
        ],
        backpack_usage: [
            "{player} uses their backpack as shelter from the elements",
            "{player} organizes their supplies in their backpack",
            "{player} uses their backpack to carry more items",
            "{player} creates a makeshift tent with their backpack",
            "{player} uses their backpack to protect their gear from rain"
        ],
        sleeping_bag_usage: [
            "{player} uses their sleeping bag for warmth during the cold night",
            "{player} wraps themselves in their sleeping bag for comfort",
            "{player} uses their sleeping bag to stay warm and dry",
            "{player} creates a cozy nest with their sleeping bag",
            "{player} uses their sleeping bag to get much-needed rest"
        ],
        // Generic item events for fallback
        item_events: [
            "{player} uses their gear to improve their situation",
            "{player} makes good use of their supplies",
            "{player} uses their equipment to their advantage",
            "{player} puts their gear to practical use"
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
        // Weapon-specific combat kills
        sword_combat_kills: [
            "{killer} tracks down {victim} and cuts them down with their sword",
            "{killer} ambushes {victim} and runs them through with their blade",
            "{killer} engages {victim} in combat and strikes them down with their sword",
            "{killer} corners {victim} and delivers a fatal sword strike",
            "{killer} hunts {victim} through the forest and cuts them down"
        ],
        knife_combat_kills: [
            "{killer} stalks {victim} and stabs them in the back with their knife",
            "{killer} ambushes {victim} and slits their throat with their blade",
            "{killer} catches {victim} off-guard and plunges their knife into their chest",
            "{killer} sneaks up on {victim} and stabs them repeatedly",
            "{killer} wrestles {victim} to the ground and finishes them with their knife"
        ],
        bow_combat_kills: [
            "{killer} takes aim and shoots {victim} through the heart with an arrow",
            "{killer} fires an arrow that pierces {victim}'s skull from a distance",
            "{killer} shoots {victim} in the back as they flee through the trees",
            "{killer} aims carefully and sends an arrow through {victim}'s throat",
            "{killer} fires multiple arrows until one finds {victim}'s vital organs"
        ],
        spear_combat_kills: [
            "{killer} charges at {victim} and impales them on their spear",
            "{killer} throws their spear with deadly accuracy, killing {victim}",
            "{killer} thrusts their spear through {victim}'s chest in combat",
            "{killer} pins {victim} against a tree with their spear",
            "{killer} strikes {victim} down with a powerful spear thrust"
        ],
        axe_combat_kills: [
            "{killer} chops {victim} down with a devastating axe blow",
            "{killer} swings their axe and cleaves {victim} in half",
            "{killer} buries their axe in {victim}'s skull",
            "{killer} hacks at {victim} with their axe until they fall",
            "{killer} splits {victim}'s head open with their axe"
        ],
        bare_hands_combat_kills: [
            "{killer} wrestles {victim} to the ground and strangles them",
            "{killer} beats {victim} to death with their bare fists",
            "{killer} snaps {victim}'s neck in a desperate struggle",
            "{killer} chokes {victim} to death with their hands",
            "{killer} crushes {victim}'s windpipe in combat"
        ],
        improvised_combat_kills: [
            "{killer} bludgeons {victim} to death with a rock",
            "{killer} strangles {victim} with a piece of rope",
            "{killer} beats {victim} with a heavy branch",
            "{killer} crushes {victim}'s skull with a large stone",
            "{killer} drowns {victim} in a nearby stream"
        ],
        // Environmental/trap kills
        environmental_kills: [
            "{killer} pushes {victim} off a cliff to their death",
            "{killer} sets a trap that kills {victim}",
            "{killer} poisons {victim}'s water supply",
            "{killer} crushes {victim} with a falling log",
            "{killer} drowns {victim} in a river"
        ],
        // Generic combat kills for fallback
        combat_kills: [
            "{killer} tracks down and kills {victim}",
            "{killer} ambushes {victim} near the water source",
            "{killer} hunts down {victim} and kills them"
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
            "{player} discovers a pristine mountain spring, quenching their thirst with crystal-clear water",
            "{player} successfully hunts a plump rabbit, their first real meal in days",
            "{player} finds a hidden cave that provides perfect shelter from the elements",
            "{player} discovers a patch of healing herbs and treats their wounds with nature's medicine",
            "{player} stumbles upon an abandoned backpack filled with valuable supplies",
            "{player} catches several fish in a babbling stream, their luck finally turning",
            "{player} builds a roaring fire that warms their bones and lifts their spirits",
            "{player} crafts a crude but effective spear from fallen branches and sharp stones",
            "{player} finds a grove of edible berries and roots, nature's bounty",
            "{player} discovers a sponsor gift parachuted from above, containing food and medicine"
        ],
        survival_neutral: [
            "{player} carefully explores the eastern part of the arena, mapping the terrain",
            "{player} practices throwing knives at tree stumps, honing their combat skills",
            "{player} stays hidden in the dense canopy, watching and waiting",
            "{player} searches for other tributes, their senses alert for danger",
            "{player} follows a winding river downstream, hoping it leads to safety",
            "{player} sets up a well-concealed camp for the night",
            "{player} camouflages themselves with mud and leaves, becoming one with nature",
            "{player} climbs to a high vantage point to scout the surrounding area",
            "{player} travels north through the forest, searching for supplies",
            "{player} rests in a hidden spot, recovering their strength for the trials ahead"
        ],
        alliances: [
            "{player1} and {player2} share their food, strengthening their bond",
            "{player1} and {player2} decide to work together for mutual survival",
            "{player1} tends to {player2}'s wounds with care and compassion",
            "{player1} and {player2} hunt together, coordinating their efforts",
            "{player1} gives {player2} extra water, showing trust and friendship",
            "{player1} and {player2} make camp together, finding comfort in each other's presence",
            "{player1} shares their food with {player2}, both gaining strength from the meal",
            "{player1} offers {player2} water from their supply, deepening their alliance"
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
            "{alliance_members} hunt for other tributes together",
            "{alliance_members} scout the area for potential targets",
            "{alliance_members} set up an ambush for unsuspecting tributes",
            "{alliance_members} coordinate a search pattern to find enemies",
            "{alliance_members} plan their next move against remaining tributes",
            "{alliance_members} track down a lone tribute",
            "{alliance_members} set traps to catch other tributes"
        ],
        alliance_combat: [
            "{alliance_members} engage in combat with another group",
            "{alliance_members} fight against a rival alliance",
            "{alliance_members} launch a coordinated attack",
            "{alliance_members} defend their territory from intruders",
            "{alliance_members} battle for control of resources",
            "{alliance_members} fight to eliminate competition",
            "{alliance_members} engage in a fierce group battle"
        ],
        alliance_victory: [
            "{alliance_members} successfully eliminate their targets",
            "{alliance_members} claim victory in the battle",
            "{alliance_members} secure their position",
            "{alliance_members} gain valuable supplies from their victory",
            "{alliance_members} strengthen their bond through shared combat",
            "{alliance_members} celebrate their successful hunt",
            "{alliance_members} consolidate their power"
        ],
        // Enhanced courage events (70+ courage)
        courage_events: [
            "{player} boldly hunts for other tributes, their confidence radiating",
            "{player} confronts a dangerous situation head-on with unwavering determination",
            "{player} takes a calculated risk to gain supplies, their courage driving them forward",
            "{player} stands their ground against threats, refusing to back down",
            "{player} charges into battle with fierce determination",
            "{player} boldly challenges other tributes to combat",
            "{player} fearlessly explores dangerous areas for supplies",
            "{player} takes the initiative in a dangerous situation"
        ],
        // Enhanced cowardice events (70+ cowardice)
        cowardice_events: [
            "{player} hides in the bushes, trembling with fear and too scared to move",
            "{player} flees at the first sign of danger, their cowardice overwhelming them",
            "{player} cowers behind cover, paralyzed with fear and unable to act",
            "{player} avoids all confrontation, their fear controlling their every move",
            "{player} shakes uncontrollably as they hide from every sound",
            "{player} whimpers in fear at the slightest noise",
            "{player} curls up in a ball, too terrified to face the world",
            "{player} runs away from their own shadow in panic"
        ],
        // Enhanced mental breakdown events (<20 mental health)
        mental_breakdown: [
            "{player} has a complete mental breakdown, screaming and crying uncontrollably",
            "{player} becomes paranoid and attacks shadows, convinced they're being watched",
            "{player} loses all focus and stumbles into danger, their mind shattered",
            "{player} starts talking to themselves, having full conversations with imaginary people",
            "{player} hallucinates, seeing things that aren't there and reacting to them",
            "{player} becomes completely unhinged, laughing maniacally at nothing",
            "{player} loses touch with reality, unable to distinguish friend from foe",
            "{player} breaks down sobbing, unable to cope with the pressure"
        ],
        // New desperation events for players lacking critical supplies
        desperation_events: [
            "{player} desperately searches for food, their hunger driving them to take risks",
            "{player} frantically looks for water, their thirst becoming unbearable",
            "{player} scavenges desperately for any supplies, their situation becoming dire",
            "{player} takes dangerous risks to find shelter, their desperation growing",
            "{player} becomes increasingly desperate as their supplies dwindle",
            "{player} makes reckless decisions out of sheer desperation",
            "{player} becomes more aggressive as their situation becomes more desperate",
            "{player} starts to lose hope as their resources run out"
        ]
    },

    night: {
        // Weapon-specific stealth kills
        knife_stealth_kills: [
            "{killer} silently slits {victim}'s throat while they sleep",
            "{killer} creeps up on {victim} and stabs them in the heart with their knife",
            "{killer} quietly plunges their knife into {victim}'s chest as they sleep",
            "{killer} sneaks up on {victim} and cuts their throat with their blade",
            "{killer} silently stabs {victim} repeatedly in their sleep"
        ],
        sword_stealth_kills: [
            "{killer} silently decapitates {victim} while they sleep",
            "{killer} creeps up on {victim} and runs them through with their sword",
            "{killer} quietly cuts {victim}'s throat with their blade",
            "{killer} sneaks up on {victim} and strikes them down with their sword",
            "{killer} silently thrusts their sword through {victim}'s chest"
        ],
        bow_stealth_kills: [
            "{killer} takes careful aim and shoots {victim} through the heart as they sleep",
            "{killer} fires a silent arrow that pierces {victim}'s skull",
            "{killer} shoots {victim} in the back as they rest",
            "{killer} aims in the darkness and sends an arrow through {victim}'s throat",
            "{killer} fires an arrow that finds {victim}'s heart in the night"
        ],
        spear_stealth_kills: [
            "{killer} silently impales {victim} on their spear while they sleep",
            "{killer} creeps up on {victim} and thrusts their spear through their chest",
            "{killer} quietly throws their spear, killing {victim} in their sleep",
            "{killer} sneaks up on {victim} and strikes them down with their spear",
            "{killer} silently pins {victim} to the ground with their spear"
        ],
        axe_stealth_kills: [
            "{killer} silently chops {victim} down with their axe while they sleep",
            "{killer} creeps up on {victim} and buries their axe in their skull",
            "{killer} quietly hacks at {victim} with their axe until they die",
            "{killer} sneaks up on {victim} and splits their head open with their axe",
            "{killer} silently strikes {victim} down with their axe"
        ],
        bare_hands_stealth_kills: [
            "{killer} quietly strangles {victim} in the darkness",
            "{killer} silently smothers {victim} with their own sleeping bag",
            "{killer} creeps up on {victim} and breaks their neck",
            "{killer} quietly chokes {victim} to death in their sleep",
            "{killer} silently crushes {victim}'s windpipe"
        ],
        improvised_stealth_kills: [
            "{killer} silently bludgeons {victim} to death with a rock",
            "{killer} quietly strangles {victim} with a piece of rope",
            "{killer} creeps up on {victim} and beats them with a branch",
            "{killer} silently crushes {victim}'s skull with a stone",
            "{killer} quietly drowns {victim} in a nearby puddle"
        ],
        // Environmental stealth kills
        environmental_stealth_kills: [
            "{killer} pushes {victim} into the campfire while they sleep",
            "{killer} quietly tips {victim} into a deep pit",
            "{killer} silently pushes {victim} off a cliff in the darkness",
            "{killer} creeps up on {victim} and drowns them in a stream",
            "{killer} quietly leads {victim} into a deadly trap"
        ],
        // Generic stealth kills for fallback
        stealth_kills: [
            "{killer} slits {victim}'s throat while they sleep",
            "{killer} quietly strangles {victim} in the darkness",
            "{killer} silently kills {victim} in their sleep"
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
            "{player} carefully tends to their injuries by the dim light of the moon",
            "{player} keeps a vigilant watch all night, their eyes scanning the darkness",
            "{player} finds warmth near a natural steam vent, grateful for the heat",
            "{player} quietly sharpens their weapon, the sound of metal on stone echoing softly",
            "{player} starts a small, controlled fire for warmth and comfort",
            "{player} finds shelter under a protective rock overhang, safe from the elements"
        ],
        emotional: [
            "{player} breaks down in tears, overwhelmed by thoughts of home and family",
            "{player} suffers from vivid nightmares about the brutal games",
            "{player} quietly hums a lullaby to themselves, trying to stay calm",
            "{player} talks to themselves in hushed tones, fighting to maintain their sanity",
            "{player} kneels in prayer, desperately seeking divine intervention",
            "{player} counts the stars above, using them as a lifeline to stay awake",
            "{player} whispers words of encouragement to themselves, fighting despair",
            "{player} closes their eyes and tries to remember their family's loving faces"
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