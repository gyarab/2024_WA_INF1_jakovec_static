import { AREA_TYPES } from "../enums/areaTypes.js";

export function getBisonAdjacentTiles(getAreas) {
    const areas = getAreas();
    const bisonAdjacent = new Set();
    const deltas = [[0,-1],[1,0],[0,1],[-1,0]];

    for (const area of areas) {
        if (area.type !== AREA_TYPES.BISONS) continue;
        for (let x = area.x; x < area.x + area.sizeX; x++) {
            for (let y = area.y; y < area.y + area.sizeY; y++) {
                for (const [dx, dy] of deltas) {
                    bisonAdjacent.add(`${x + dx},${y + dy}`);
                }
            }
        }
    }
    return bisonAdjacent;
}

export function countConnectedBisonRails(tileX, tileY, occupiedTiles, getAreas) {
    const bisonAdjacent = getBisonAdjacentTiles(getAreas);
    if (!bisonAdjacent.has(`${tileX},${tileY}`)) return 0;

    const visited = new Set();
    const queue = [`${tileX},${tileY}`];
    visited.add(`${tileX},${tileY}`);
    let count = 0;

    while (queue.length > 0) {
        const current = queue.shift();
        if (bisonAdjacent.has(current)) {
            count++;
            const [cx, cy] = current.split(',').map(Number);
            const deltas = [[0,-1],[1,0],[0,1],[-1,0]];
            for (const [dx, dy] of deltas) {
                const nk = `${cx + dx},${cy + dy}`;
                if (!visited.has(nk) && occupiedTiles.has(nk)) {
                    visited.add(nk);
                    queue.push(nk);
                }
            }
        }
    }
    return count;
}

function isBisonAreaDisturbed(area, occupiedTiles) {
    for (let x = area.x; x < area.x + area.sizeX; x++) {
        for (let y = area.y; y < area.y + area.sizeY; y++) {
            if (occupiedTiles.has(`${x},${y}`)) return true;
        }
    }
    return false;
}

export function calcBisonProfitForPath(path, getAreas, occupiedTiles, isBisonUnlocked) {
    if (!isBisonUnlocked) return 0;

    const areas = getAreas();
    const bisonAreas = areas.filter(a => a.type === AREA_TYPES.BISONS);
    const deltas = [[0,-1],[1,0],[0,1],[-1,0]];

    //pouze neporusene
    const validAdjacentTiles = new Set();
    for (const area of bisonAreas) {
        if (isBisonAreaDisturbed(area, occupiedTiles)) continue;
        for (let x = area.x; x < area.x + area.sizeX; x++) {
            for (let y = area.y; y < area.y + area.sizeY; y++) {
                for (const [dx, dy] of deltas) {
                    validAdjacentTiles.add(`${x + dx},${y + dy}`);
                }
            }
        }
    }

    const counted = new Set();
    let total = 0;

    for (const tile of path) {
        const key = `${tile.x},${tile.y}`;
        if (!validAdjacentTiles.has(key) || counted.has(key)) continue;
        counted.add(key);
        total++;
    }

    return Math.round(total /2);
}