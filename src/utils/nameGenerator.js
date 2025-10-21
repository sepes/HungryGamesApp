const firstNames = [
    'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Gray', 'Hayden',
    'Jordan', 'Kai', 'Lane', 'Morgan', 'Nova', 'Parker', 'Quinn', 'River',
    'Sage', 'Taylor', 'Vale', 'Wren', 'Zion', 'Aria', 'Blaze', 'Cedar',
    'Dune', 'Echo', 'Flint', 'Gale', 'Haven', 'Iris', 'Jade', 'Koda',
    'Luna', 'Moss', 'Nyx', 'Orion', 'Phoenix', 'Raven', 'Sky', 'Thorn',
    'Vale', 'Willow', 'Xara', 'Yara', 'Zara', 'Aiden', 'Brooke', 'Cameron',
    'Dakota', 'Eden', 'Felix', 'Grace', 'Hunter', 'Ivy', 'Jasper', 'Kira',
    'Liam', 'Maya', 'Noah', 'Olive', 'Piper', 'Quinn', 'Ruby', 'Sawyer',
    'Tessa', 'Uma', 'Violet', 'Wyatt', 'Xander', 'Yuki', 'Zoe'
];

const lastNames = [
    'Smith', 'Jones', 'River', 'Stone', 'Wood', 'Hill', 'Lake', 'Forest',
    'Meadow', 'Brook', 'Ridge', 'Valley', 'Creek', 'Pine', 'Oak', 'Ash',
    'Elm', 'Maple', 'Cedar', 'Willow', 'Sage', 'Thorn', 'Blaze', 'Storm',
    'Wind', 'Rain', 'Snow', 'Frost', 'Ember', 'Flame', 'Star', 'Moon',
    'Sun', 'Sky', 'Cloud', 'Mist', 'Dawn', 'Dusk', 'Night', 'Day',
    'Bright', 'Dark', 'Light', 'Shadow', 'Crystal', 'Silver', 'Gold',
    'Copper', 'Iron', 'Steel', 'Bronze', 'Pearl', 'Ruby', 'Sapphire',
    'Emerald', 'Diamond', 'Amber', 'Jade', 'Onyx', 'Quartz', 'Topaz'
];

export function generateRandomName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
}

export function generateAllNames(count) {
    const names = new Set();

    while (names.size < count) {
        const name = generateRandomName();
        names.add(name);
    }

    return Array.from(names);
}