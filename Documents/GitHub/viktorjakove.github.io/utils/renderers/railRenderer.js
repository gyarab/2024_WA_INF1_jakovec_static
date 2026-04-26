import { SCREEN_DIMENSIONS } from "../../screenDimensions.js";
import { createRailPathfinder } from "../railPathfinder.js";
import { AREA_TYPES } from "../../enums/areaTypes.js";
import { AREA_GEN_DATA } from "../../mapGenData/areaGenData.js";
import { OPPOSITE } from "../../enums/railTypes.js"
import { getBisonAdjacentTiles, countConnectedBisonRails , calcBisonProfitForPath} from "../bisonProfit.js";

export function createRailRenderer(app, camera, getGridScale, cellSize, getAreas,getLevel, getMoney, addMoney, subMoney, getRelations, setRelations, areaRenderer) {
    const railContainer = new PIXI.Container();
    railContainer.zIndex = 3;
    app.stage.addChild(railContainer);

    const areaRendererRef = areaRenderer;

    const rails = []; //x, y, sprite
    const occupiedTiles = new Map();

    const { areStationsConnected, getPath } = createRailPathfinder(occupiedTiles);

    let railDirty = true;
    let lastCameraPos = { x: 0, y: 0 };
    let lastGridScale = 1;

    const spritePool = [];

    const textureCache = new Map();

    function getTexture(path) {
        if (!textureCache.has(path)) {
            textureCache.set(path, PIXI.Texture.from(path));
        }
        return textureCache.get(path);
    }

    function getPooledSprite() {
        return spritePool.pop() || new PIXI.Sprite();
    }
    function returnSprite(sprite) {
        sprite.texture = PIXI.Texture.EMPTY;
        spritePool.push(sprite);
    }

    function getRailAt(tileX, tileY) {
        return occupiedTiles.get(`${tileX},${tileY}`) ?? null;
    }

    function isTileOccupied(tileX, tileY) {
        return occupiedTiles.has(`${tileX},${tileY}`);
    }
    function isTileBlocked(tileX, tileY) {
        const areas = getAreas();
        return areas.some(area => {
            if (area.type !== AREA_TYPES.CITY && area.type !== AREA_TYPES.LAKE) return false;
            return tileX >= area.x && tileX < area.x + area.sizeX &&
                   tileY >= area.y && tileY < area.y + area.sizeY;
        });
    }
    function isOutOfBounds(tileX, tileY) {
        
        const width = AREA_GEN_DATA.areaSize[getLevel()][0]/2;
        const height = AREA_GEN_DATA.areaSize[getLevel()][1]/2;
        return tileX >= width || tileY >= height || tileX < -width || tileY < -height;
    }
    function isCompatibleWithNeighbors(tileX, tileY, railType) {
        const deltas = [[0,-1],[1,0],[0,1],[-1,0]];
        for (let side = 0; side < 4; side++) {
            const [dx, dy] = deltas[side];
            const neighbor = getRailAt(tileX + dx, tileY + dy);
            if (!neighbor) continue;

            const newConnects = railType.connections[side];
            const neighborConnects = neighbor.type.connections[OPPOSITE[side]];

            if (newConnects !== neighborConnects) return false;
        }
        return true;
    }
    function isTileOnIndianArea(tileX, tileY) {
        const areas = getAreas();
        return areas.some(area =>
            area.type === AREA_TYPES.INDIANS &&
            tileX >= area.x && tileX < area.x + area.sizeX &&
            tileY >= area.y && tileY < area.y + area.sizeY
        );
    }

    function getBuildOverCost(tileX, tileY) {
        const areas = getAreas();
        let totalExtraCost = 0;
        
        areas.forEach(area => {
            if (area.type === AREA_TYPES.LOCK) return;
            
            const within = tileX >= area.x &&
                tileX < area.x + area.sizeX &&
                tileY >= area.y &&
                tileY < area.y + area.sizeY;
                
            if (within && area.type.buildOverCost) {
                totalExtraCost += area.type.buildOverCost;
            }
        });
        
        return totalExtraCost;
    }

    function addRail(tileX, tileY, railType) {
        
        const buildOverCost = getBuildOverCost(tileX, tileY);
        const totalCost = railType.cost + buildOverCost;
        
        if(!railType || getMoney() < totalCost) {
            return false;
        }
        if (isTileOccupied(tileX, tileY) || isTileBlocked(tileX,tileY) || isOutOfBounds(tileX,tileY) || !isCompatibleWithNeighbors(tileX,tileY,railType)) return false;
    
        const rail = { x: tileX, y: tileY, type: railType };
        rails.push(rail);
        occupiedTiles.set(`${tileX},${tileY}`,rail);
    
        railDirty = true;
    
        if (setRelations && getRelations && isTileOnIndianArea(tileX, tileY)) {
            setRelations(getRelations() + 1);
        }
    
        if (onRailPlaced) onRailPlaced();

        subMoney(totalCost);
        
        removeAreaTile(tileX, tileY);
    
        return true;
    }

    function removeRail(tileX, tileY, indebted) {
        const key = `${tileX},${tileY}`;
        if (!occupiedTiles.has(key)) return;

        const rail = occupiedTiles.get(key);
        if (!indebted)addMoney(Math.round(rail.type.cost / 2));	

        occupiedTiles.delete(key);
        const index = rails.findIndex(r => r.x === tileX && r.y === tileY);
        if (index !== -1) {
            rails.splice(index, 1);
            railDirty = true;
        }

        if (setRelations && getRelations && isTileOnIndianArea(tileX, tileY)) {
            setRelations(getRelations() - 1);
        }

        if(onRailPlaced)onRailPlaced();
    }

    function drawRails() {
        const gridScale = getGridScale();
        const cameraChanged = camera.x !== lastCameraPos.x || camera.y !== lastCameraPos.y;
        const scaleChanged = gridScale !== lastGridScale;

        if (!railDirty && !cameraChanged && !scaleChanged) return;

        while (railContainer.children.length > 0) {
            returnSprite(railContainer.removeChildAt(0));
        }

        const dimensions = SCREEN_DIMENSIONS(app, camera, gridScale, cellSize);

        for (const rail of rails) {
            const screenX = rail.x * cellSize - dimensions.worldLeft;
            const screenY = rail.y * cellSize - dimensions.worldTop;

            const texture = getTexture(rail.type.texture);
            const sprite = getPooledSprite();
            sprite.texture = texture;
            sprite.x = screenX;
            sprite.y = screenY;
            sprite.width = cellSize;
            sprite.height = cellSize;
            railContainer.addChild(sprite);
        }

        lastCameraPos = { x: camera.x, y: camera.y };
        lastGridScale = gridScale;
        railDirty = false;
    }

    function markDirty() { railDirty = true; }

    function getRails() {
        return rails.map(r => ({ x: r.x, y: r.y, typeId: r.type.id }));
    }
    function loadRails(data, railTypesMap) {
        rails.length = 0;
        occupiedTiles.clear();
        for (const r of data) {
            const type = railTypesMap[r.typeId];
            if(!type) continue;
            const rail = { x: r.x, y: r.y, type };
            rails.push(rail);
            occupiedTiles.set(`${r.x},${r.y}`, rail);
        }
        railDirty = true;
    }

    let onRailPlaced = null;
    function setOnRailPlaceCheckConn(callback) {
        onRailPlaced = callback;
    }

    function getBisonProfit(path) {
        const profit = calcBisonProfitForPath(path, getAreas, occupiedTiles, window.bisonManager ? window.bisonManager.isBisonUnlocked() : false);
        return profit;
    }
    function removeAreaTile(tileX, tileY) {
        const areas = getAreas();
        let areaRemoved = false;
        
        for (let i = areas.length - 1; i >= 0; i--) {
            const area = areas[i];
            
            if (area.type !== AREA_TYPES.FOREST && area.type !== AREA_TYPES.ROCK) continue;
            
            const withinArea = tileX >= area.x && tileX < area.x + area.sizeX &&
                               tileY >= area.y && tileY < area.y + area.sizeY;
            
            if (withinArea) {
                if (area.sizeX === 1 && area.sizeY === 1) {
                    areas.splice(i, 1);
                    areaRemoved = true;
                } else {
                    const newAreas = splitAreaAtTile(area, tileX, tileY);
                    areas.splice(i, 1);
                    
                    for (const newArea of newAreas) {
                        if (newArea.sizeX > 0 && newArea.sizeY > 0) {
                            areas.push(newArea);
                        }
                    }
                    
                    areaRemoved = true;
                }
                
                if (areaRendererRef) {
                    areaRendererRef.removeSpriteAt(tileX, tileY);
                }
            }
        }
        
        if (areaRemoved && areaRendererRef) {
            areaRendererRef.markDirty();
        }
        
        return areaRemoved;
    }
    
    function splitAreaAtTile(area, removeX, removeY) {
        const result = [];
        
        if (removeX > area.x) {
            result.push(new Area(
                area.type,
                area.x,
                area.y,
                removeX - area.x,
                area.sizeY,
                area.name,
                0,
                area.description || "",
                ""
            ));
        }
        
        if (removeX + 1 < area.x + area.sizeX) {
            result.push(new Area(
                area.type,
                removeX + 1,
                area.y,
                area.x + area.sizeX - (removeX + 1),
                area.sizeY,
                area.name,
                0,
                area.description || "",
                ""
            ));
        }
        
        if (removeY > area.y) {
            result.push(new Area(
                area.type,
                removeX,
                area.y,
                1,
                removeY - area.y,
                area.name,
                0,
                area.description || "",
                ""
            ));
        }
        
        if (removeY + 1 < area.y + area.sizeY) {
            result.push(new Area(
                area.type,
                removeX,
                removeY + 1,
                1,
                area.y + area.sizeY - (removeY + 1),
                area.name,
                0,
                area.description || "",
                ""
            ));
        }
        
        return result;
    }
    function getOccupiedTiles() {
        const tiles = [];
        for (const [key, rail] of occupiedTiles.entries()) {
            const [x, y] = key.split(',').map(Number);
            tiles.push({ x, y, type: rail.type });
        }
        return tiles;
    }

    return { addRail, removeRail, drawRails, isTileOccupied, markDirty, getRails, loadRails, areStationsConnected, getPath, setOnRailPlaceCheckConn, getBisonProfit, isCompatibleWithNeighbors,getOccupiedTiles};
}