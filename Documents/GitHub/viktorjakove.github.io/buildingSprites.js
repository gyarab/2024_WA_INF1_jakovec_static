export function createBuildingSpritesManager(app, camera, getGridScale, cellSize, characterOverlay, getShiftPressed, getPlacementMode) {
    const container = new PIXI.Container();
    container.zIndex = 11;
    app.stage.addChild(container);

    //cache
    const textureCache = new Map();
    const citySprites = new Map();

    let lastPlacementMode = false;

    function updateAlphas() {
        const currentPlacementMode = getPlacementMode ? getPlacementMode() : false;
        
        if (currentPlacementMode !== lastPlacementMode) {
            lastPlacementMode = currentPlacementMode;
            
            const targetAlpha = currentPlacementMode ? 0.9 : 0.5; // Buildmode = 0.9, normal = 0.4
            
            for (const [_, data] of citySprites) {
                data.sprite.alpha = targetAlpha;
            }
        }
    }

    function getScreenPosition(worldX, worldY) {
        const gridScale = getGridScale();
        const screenWidth = app.screen.width / gridScale;
        const screenHeight = app.screen.height / gridScale;
        
        const worldLeft = camera.x - screenWidth / 2;
        const worldTop = camera.y - screenHeight / 2;
        
        return {
            x: worldX - worldLeft,
            y: worldY - worldTop
        };
    }

    function getBuildingTexture(buildingName) {
        if (!buildingName || buildingName === "none") return null;
        
        const cacheKey = `building_${buildingName}`;
        if (!textureCache.has(cacheKey)) {
            const path = `../../graphics/icons/${buildingName}.png`;
            const texture = PIXI.Texture.from(path);
            textureCache.set(cacheKey, texture);
        }
        return textureCache.get(cacheKey);
    }

    function createSprite(city) {
        if (!city || city.building === "none" || citySprites.has(city.name)) return false;
        
        const texture = getBuildingTexture(city.building);
        if (!texture) return false;
        
        const worldX = (city.x + city.sizeX / 2) * cellSize;
        const worldY = (city.y + city.sizeY / 2) * cellSize;
        
        const screenPos = getScreenPosition(worldX, worldY);
        
        //velikost
        const cityMinSize = Math.min(city.sizeX, city.sizeY);
        const spriteSize = (cityMinSize * cellSize / 10 * 9);
        
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.x = screenPos.x;
        sprite.y = screenPos.y;
        
        const setScale = () => {
            if (sprite.texture && sprite.texture.valid) {
                const scale = spriteSize / Math.max(sprite.texture.width, sprite.texture.height);
                sprite.scale.set(scale);
            }
        };
        
        if (texture.valid) {
            setScale();
        } else {
            texture.once('update', setScale);
        }
        
        //fadein
        sprite.alpha = 0;
        const startTime = Date.now();
        const duration = 2000;
        const targetAlpha = getPlacementMode ? (getPlacementMode() ? 0.9 : 0.4) : 0.9;

        const animateFade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            sprite.alpha = eased * targetAlpha;

            if (progress < 1) {
                requestAnimationFrame(animateFade);
            } else {
                sprite.alpha = targetAlpha;
            }
        };
        animateFade();
        
        sprite.interactive = true;
        sprite.cursor = "pointer";
        sprite.on('pointerdown', (e) => {
            e.stopPropagation();
            if (characterOverlay && !characterOverlay.isVisible()) {
                characterOverlay.showCityInfo(city);
            }
        });
        
        container.addChild(sprite);
        
        citySprites.set(city.name, { sprite, city, worldX, worldY });
        return true;
    }

    function updatePositions() {
        const shiftPressed = getShiftPressed ? getShiftPressed() : false;
        
        container.visible = !shiftPressed;
        
        if (!shiftPressed) {
            for (const [_, data] of citySprites) {
                const { sprite, worldX, worldY } = data;
                const screenPos = getScreenPosition(worldX, worldY);
                sprite.x = screenPos.x;
                sprite.y = screenPos.y;
            }
        }
    }

    function removeSprite(cityName) {
        const data = citySprites.get(cityName);
        if (data) {
            container.removeChild(data.sprite);
            data.sprite.destroy();
            citySprites.delete(cityName);
        }
    }

    function hasSprite(cityName) {
        return citySprites.has(cityName);
    }

    function clearAll() {
        for (const [_, data] of citySprites) {
            container.removeChild(data.sprite);
            data.sprite.destroy();
        }
        citySprites.clear();
    }

    function refresh() {
        updatePositions();
        updateAlphas();
    }

    return {
        container,
        createSprite,
        removeSprite,
        updatePositions,
        hasSprite,
        clearAll,
        refresh,
        updateAlphas
    };
}