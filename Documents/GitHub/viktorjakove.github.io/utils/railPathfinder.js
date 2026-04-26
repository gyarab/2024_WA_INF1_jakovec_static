import { OPPOSITE } from '../enums/railTypes.js';
export function createRailPathfinder(occupiedTiles) {
    const DELTAS = [[0,-1],[1,0],[0,1],[-1,0]];

    function getNeighborKeys(x, y) {
        const rail = occupiedTiles.get(`${x},${y}`);
        if (!rail) return [];

        const neighbors = [];
        for (let side = 0; side < 4; side++) {
            if (!rail.type.connections[side]) continue;
            const [dx, dy] = DELTAS[side];
            const nx = x + dx, ny = y + dy;
            const neighborKey = `${nx},${ny}`;
            const neighbor = occupiedTiles.get(neighborKey);
            if (neighbor && neighbor.type.connections[OPPOSITE[side]]) {
                neighbors.push(neighborKey);
            }
        }
        return neighbors;
    }

    function areStationsConnected(x1, y1, x2, y2) {
        if (!occupiedTiles.has(`${x1},${y1}`) || !occupiedTiles.has(`${x2},${y2}`)) return false;
        if (x1 === x2 && y1 === y2) return true;

        const visited = new Set();
        const queue = [`${x1},${y1}`];
        visited.add(`${x1},${y1}`);
        const target = `${x2},${y2}`;

        while (queue.length > 0) {
            const current = queue.shift();
            const [cx, cy] = current.split(',').map(Number);
            for (const neighbor of getNeighborKeys(cx, cy)) {
                if (neighbor === target) return true;
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        return false;
    }

    function getPath(x1, y1, x2, y2) {
        if (!occupiedTiles.has(`${x1},${y1}`) || !occupiedTiles.has(`${x2},${y2}`)) return null;
        if (x1 === x2 && y1 === y2) return [{ x: x1, y: y1 }];
    
        const visited = new Map(); // key -> parentKey
        const queue = [`${x1},${y1}`];
        visited.set(`${x1},${y1}`, null);
        const target = `${x2},${y2}`;
    
        while (queue.length > 0) {
            const current = queue.shift();
            if (current === target) {
                const path = [];
                let node = current;
                while (node !== null) {
                    const [nx, ny] = node.split(',').map(Number);
                    path.push({ x: nx, y: ny });
                    node = visited.get(node);
                }
                return path.reverse();
            }
            const [cx, cy] = current.split(',').map(Number);
            for (const neighbor of getNeighborKeys(cx, cy)) {
                if (!visited.has(neighbor)) {
                    visited.set(neighbor, current);
                    queue.push(neighbor);
                }
            }
        }
        return null;
    }

    return { areStationsConnected, getPath };
}