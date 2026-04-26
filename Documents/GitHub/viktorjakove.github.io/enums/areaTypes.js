export const AREA_TYPES = {
    CITY: {type: "city", color: 0xff0000, getSpriteCount: () => Math.random() < 0.9 ? 1 : 0, minSpriteSize: 0.3,maxSpriteSize: 0.4},
    LAKE: {type: "lake", color: 0x00ffff,getSpriteCount: () => Math.random() < 0.8 ? 1 : 0, minSpriteSize: 0.3,maxSpriteSize: 0.4},
    INDIANS: {type: "indians",color: 0xCD5C5C, buildOverColor: 0xffffff, buildOverInfo: "Vykopávat válečnou sekeru??"},
    BISONS: {type: "bisons",color: 0xB8860B, buildOverColor: 0xffaaaa, buildOverInfo : "Zruší veškerý příjem z této oblasti!",getSpriteCount: () => Math.random() < 0.8 ? 1 : (Math.random() < 0.33 ? 2: (Math.random() < 0.15 ? 4: 3)), minSpriteSize: 0.2,maxSpriteSize: 0.3},
    ROCK: {type: "rock",color: 0x696969, buildOverColor: 0xfffaaa, buildOverCost: 200,getSpriteCount: () => Math.random() < 0.9 ? 1 : (Math.random() < 0.5 ? 2:0), minSpriteSize: 0.3,maxSpriteSize: 0.4},
    FOREST: {type: "forest",color: 0x006400, buildOverColor: 0xfffaaa, buildOverCost: 40, getSpriteCount: () => Math.random() < 0.8 ? 1 : (Math.random() < 0.33 ? 2: (Math.random() < 0.15 ? 4: 3)), minSpriteSize: 0.2,maxSpriteSize: 0.5},
    LOCK: {type: "lock",color: 0x000000}
}