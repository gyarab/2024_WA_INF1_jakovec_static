import { Area } from "./area.js";
import { AREA_TYPES } from "./enums/areaTypes.js";
import { DIRECTIONS } from "./enums/directionEnum.js";
import { AREA_GEN_DATA } from "./mapGenData/areaGenData.js";
import { CITY_GEN_DATA } from "./mapGenData/cityGenData.js";
import { LAKE_GEN_DATA, FOREST_GEN_DATA, MOUNTAIN_GEN_DATA, INDIAN_GEN_DATA, BISON_GEN_DATA } from "./mapGenData/natureGenData.js";

const { CITY, LAKE, INDIANS, BISONS, FOREST, ROCK, LOCK } = AREA_TYPES;

export const generateAreas = (level, lastLockArea) => {
    while (true) {
        const result = tryGeneration(level, lastLockArea);
        if (result) return result;
        console.log("regenerating areas");
    }
}

function getAreasToGenerate(level, genData, typeCount){
    return level === 0 
    ? genData.slice(0, typeCount[level]) 
    : genData.slice(typeCount[level - 1], typeCount[level - 1] + typeCount[level]);
}

function tryGeneration(level, lockArea){
    //cache areaSize (efektivnost)
    const areaWidth = AREA_GEN_DATA.areaSize[level][0];
    const areaHeight = AREA_GEN_DATA.areaSize[level][1];

    const citiesToGenerate = getAreasToGenerate(level, CITY_GEN_DATA, AREA_GEN_DATA.cityCount);
    const lakesToGenerate = getAreasToGenerate(level, LAKE_GEN_DATA, AREA_GEN_DATA.lakeCount);
    const indiansToGenerate = getAreasToGenerate(level, INDIAN_GEN_DATA, AREA_GEN_DATA.indianAreasCount);
    const bisonsToGenerate = getAreasToGenerate(level, BISON_GEN_DATA, AREA_GEN_DATA.bisonAreasCount);

    //mapa oblastí (efektivnost)
    const allAreas = [].concat(
        citiesToGenerate.map((area, idx) => ({ ...area, type: CITY, orderInDoc: idx })),
        lakesToGenerate.map(area => ({ ...area, type: LAKE })),
        indiansToGenerate.map(area => ({ ...area, type: INDIANS })),
        bisonsToGenerate.map(area => ({ ...area, type: BISONS }))
    );

    const cityOrderMap = new Map(citiesToGenerate.map((c, i) => [c.name, i]));

    //od nejvetsiho po nejmensi bez lesu a hor
    const sortedAreas = allAreas.sort((a, b) => (b.sizeX * b.sizeY) - (a.sizeX * a.sizeY));
    const placedAreas = [];
    if(lockArea) placedAreas.push(lockArea);

    for (const area of sortedAreas) {
        let cycles = 0;
        //tady
        const maxCycles = 5000;
        let placed = false;

        while(cycles < maxCycles){
            cycles++;
            const x = getRandom(-areaWidth / 2 + 1, areaWidth / 2 - 1 - area.sizeX);
            const y = getRandom(-areaHeight / 2 + 1, areaHeight / 2 - 1 - area.sizeY);
            const collision = placedAreas.some((placedArea) =>{
                
                //mesta 2, osattni 1
                const gap = area.type === CITY && placedArea.type === CITY ? 2 : 1;

                if (!(x + area.sizeX + gap <= placedArea.x || 
                    x >= placedArea.x + placedArea.sizeX + gap ||
                    y + area.sizeY + gap <= placedArea.y || 
                    y >= placedArea.y + placedArea.sizeY + gap)) {
                    return true; 
                }
                
                //city doc-neighbor distance check
                const MIN_CITY_XDISTANCE = (level === 1) ? areaWidth / 4 : 0;

                if(area.type === CITY && placedArea.type === CITY){
                    const placedAreaOrderInDoc = cityOrderMap.get(placedArea.name) ?? -1;
                    return Math.abs(area.orderInDoc - placedAreaOrderInDoc) === 1 && Math.min(Math.abs(x - placedArea.x),Math.abs(x + area.sizeX - placedArea.x),Math.abs(x - placedArea.x + placedArea.sizeX)) <= MIN_CITY_XDISTANCE;
                }
            });


            if(!collision){
                placedAreas.push(new Area(
                    area.type,
                    x,
                    y,
                    area.sizeX,
                    area.sizeY,
                    area.name,
                    area.type === CITY ? getRandom(area.peepsMin, area.peepsMax) : 0,
                    area.description ? area.description : "",
                    area.type === CITY ? area.building : ""
                ));
                placed = true;
                break;
            }
        }

        if (!placed)return null;
    };
    
    const forestsToGenerate = getAreasToGenerate(level, FOREST_GEN_DATA, AREA_GEN_DATA.forestCount);
    const mountainsToGenerate = getAreasToGenerate(level, MOUNTAIN_GEN_DATA, AREA_GEN_DATA.mountainCount);
    const allSnakeAreas = [].concat(
        forestsToGenerate.map(area => ({ ...area, type: FOREST })),
        mountainsToGenerate.map(area => ({ ...area, type: ROCK }))
    );

    const sortedSnakeAreas = allSnakeAreas.sort((a, b) => (b.thickness * b.length) - (a.length * a.thickness));
    const placedSnakeAreaParts = [];
    //set (efektivnost kontroly x,y)
    const occupiedSnakeSet = new Set();

    for (const area of sortedSnakeAreas) {

        let snakePlaced = false;
        let snakeAttempts = 0;
        const maxSnakeAttempts = area.length*3;
    
        while (!snakePlaced && snakeAttempts < maxSnakeAttempts) {
            snakeAttempts++;
    
            let x = getRandom(-areaWidth / 2 + 1, areaWidth / 2 - 1);
            let y = getRandom(-areaHeight / 2 + 1, areaHeight / 2 - 1);
            let lastDir = null;
    
            const tempParts = [];
            const tempOccupied = new Set();
            let failed = false;
    
            for (let i = 0; i < area.length; i++) {
                let placed = false;
                let cycles = 0;
                const maxCycles = area.length * area.thickness * 3;
    
                while (!placed && cycles < maxCycles) {
                    cycles++;
    
                    let OKdirections = DIRECTIONS;
                    if (area.type === ROCK && lastDir) {
                        OKdirections = DIRECTIONS.filter(d => !isOppositeDir(d, lastDir));
                    }
    
                    const dir = OKdirections[getRandom(0, OKdirections.length - 1)];
                    lastDir = dir;
    
                    const newX = x + dir.xChange * area.thickness;
                    const newY = y + dir.yChange * area.thickness;
    
                    const withinBounds = (
                        newX >= -areaWidth / 2 &&
                        newX + area.thickness <= areaWidth / 2 &&
                        newY >= -areaHeight / 2 &&
                        newY + area.thickness <= areaHeight / 2
                    );
    
                    const collision = squareCollides(
                        newX,
                        newY,
                        area.thickness,
                        placedAreas,
                        occupiedSnakeSet
                    ) || squareCollides(
                        newX,
                        newY,
                        area.thickness,
                        [],
                        tempOccupied
                    );
    
                    if (withinBounds && !collision) {
                        for (let dx = 0; dx < area.thickness; dx++) {
                            for (let dy = 0; dy < area.thickness; dy++) {
    
                                if (!shouldPlaceTile(area)) continue;
    
                                const tileX = newX + dx;
                                const tileY = newY + dy;
    
                                tempParts.push(
                                    new Area(area.type, tileX, tileY, 1, 1, area.name, 0,area.description ? area.description : "","")
                                );
    
                                tempOccupied.add(`${tileX},${tileY}`);
                            }
                        }
    
                        x = newX;
                        y = newY;
                        placed = true;
                    }
                }
    
                if (!placed) {
                    failed = true;
                    break;
                }
            }
            if (!failed) {
                for (const part of tempParts) {
                    placedSnakeAreaParts.push(part);
                    occupiedSnakeSet.add(`${part.x},${part.y}`);
                }
                snakePlaced = true;
            }
        }
        if (!snakePlaced) return null;
    }
    
    placedSnakeAreaParts.push(new Area(LOCK,-AREA_GEN_DATA.areaSize[level][0]/2,-AREA_GEN_DATA.areaSize[level][1]/2,AREA_GEN_DATA.areaSize[level][0],AREA_GEN_DATA.areaSize[level][1],"",0,"",""));

    return placedAreas.concat(placedSnakeAreaParts);
}

function squareCollides(x, y, size, placedAreas, placedSnakeParts) {
    //areas
    if (placedAreas.some(pa =>
        x < pa.x + pa.sizeX + 1 &&
        x + size > pa.x - 1 &&
        y < pa.y + pa.sizeY + 1 &&
        y + size > pa.y - 1
    )) return true;
    
    //snakes
    if (Array.isArray(placedSnakeParts)) {
        for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
                if (placedSnakeParts.some(p => p.x === x + dx && p.y === y + dy)) {
                    return true;
                }
            }
        }
    } else if (placedSnakeParts instanceof Set) {
        for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
                if (placedSnakeParts.has(`${x + dx},${y + dy}`)) return true;
            }
        }
    }

    return false;
}

function shouldPlaceTile(area) {
    const chance = area.type === FOREST ? 0.15 : 0.05;
    return !(area.thickness > 1 && Math.random() < chance);
}

function isOppositeDir(dirA, dirB) {
    return dirA.xChange === -dirB.xChange &&
           dirA.yChange === -dirB.yChange;
}

function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.round(Math.random() * (max - min) + min);
}