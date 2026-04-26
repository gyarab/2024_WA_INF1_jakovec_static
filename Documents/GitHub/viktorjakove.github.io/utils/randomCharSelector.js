export const CHAR_FOLDERS = [
    "bank",
    "barber", 
    "bussiness",
    "graveyard",
    "marco",
    "mech",
    "olda",
    "shop",
    "sheriff"
];

const FOLDERS_WITH_LETTER = [
    "bank",
    "barber",
];

const folderSpriteCounts = new Map();

export async function getRandomCharacter() {
    const randomFolder = CHAR_FOLDERS[Math.floor(Math.random() * CHAR_FOLDERS.length)];
    
    const hasLetter = FOLDERS_WITH_LETTER.includes(randomFolder);
    const maxSprites = await getMaxSpriteCount(randomFolder);
    
    let path;
    let spriteValue;
    
    if (hasLetter && Math.random() < 0.3) {
        path = `graphics/chars/${randomFolder}/${randomFolder}S.png`;
        spriteValue = 'S';
    } else {
        const num = Math.floor(Math.random() * maxSprites);
        path = `graphics/chars/${randomFolder}/${randomFolder}${num}.png`;
        spriteValue = num;
    }
    
    return {
        path,
        folder: randomFolder,
        spriteIndex: spriteValue
    };
}

async function getMaxSpriteCount(folder) {
    if (folderSpriteCounts.has(folder)) {
        return folderSpriteCounts.get(folder);
    }
    
    return new Promise((resolve) => {
        let maxFound = 0;
        let checkIndex = 0;
        let timeout = null;
        
        const checkNext = () => {
            if (timeout) clearTimeout(timeout);
            
            const path = `graphics/chars/${folder}/${folder}${checkIndex}.png`;
            const texture = PIXI.Texture.from(path);
            
            if (texture.valid) {
                maxFound = checkIndex + 1;
                checkIndex++;
                checkNext();
            } else {
                timeout = setTimeout(() => {
                    if (maxFound === 0) maxFound = 1;
                    folderSpriteCounts.set(folder, maxFound);
                    resolve(maxFound);
                }, 50);
                
                texture.once('error', () => {
                    if (maxFound === 0) maxFound = 1;
                    folderSpriteCounts.set(folder, maxFound);
                    resolve(maxFound);
                });
            }
        };
        
        checkNext();
    });
}

export async function createCharacterSprite(path, app) {
    return new Promise((resolve) => {
        const texture = PIXI.Texture.from(path);
        const sprite = new PIXI.Sprite(texture);
        
        const setScale = () => {
            const maxSize = app.screen.height * 0.3;
            const scale = maxSize / Math.max(texture.width, texture.height);
            sprite.scale.set(scale);
            resolve(sprite);
        };
        
        if (texture.valid) {
            setScale();
        } else {
            texture.once('update', setScale);
            texture.once('error', () => {
                const folder = path.split('/').slice(-2, -1)[0];
                const fallbackPath = `graphics/chars/${folder}/${folder}0.png`;
                const fallbackTexture = PIXI.Texture.from(fallbackPath);
                const fallbackSprite = new PIXI.Sprite(fallbackTexture);
                
                const setFallbackScale = () => {
                    const maxSize = app.screen.height * 0.3;
                    const scale = maxSize / Math.max(fallbackTexture.width, fallbackTexture.height);
                    fallbackSprite.scale.set(scale);
                    resolve(fallbackSprite);
                };
                
                if (fallbackTexture.valid) {
                    setFallbackScale();
                } else {
                    fallbackTexture.once('update', setFallbackScale);
                }
            });
        }
    });
}