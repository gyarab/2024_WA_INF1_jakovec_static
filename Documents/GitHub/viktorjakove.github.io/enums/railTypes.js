// connections: which sides this tile connects to [N, E, S, W] = [top, right, bottom, left]
export const RAIL_TYPES = {
    STRAIGHT_H: {
        id: "STRAIGHT_H",
        connections: [false, true, false, true],  // E-W
        texture: "../../graphics/map/rails/rail_h.png",
        cost: 10
    },
    STRAIGHT_V: {
        id: "STRAIGHT_V",
        connections: [true, false, true, false],  // N-S
        texture: "../../graphics/map/rails/rail_v.png",
        cost: 10
    },
    CURVE_NE: {
        id: "CURVE_NE",
        connections: [true, true, false, false],  // N-E
        texture: "../../graphics/map/rails/rail_ne.png",
        cost: 15
    },
    CURVE_SE: {
        id: "CURVE_SE",
        connections: [false, true, true, false],  // S-E
        texture: "../../graphics/map/rails/rail_se.png",
        cost: 15
    },
    CURVE_SW: {
        id: "CURVE_SW",
        connections: [false, false, true, true],  // S-W
        texture: "../../graphics/map/rails/rail_sw.png",
        cost: 15
    },
    CURVE_NW: {
        id: "CURVE_NW",
        connections: [true, false, false, true],  // N-W
        texture: "../../graphics/map/rails/rail_nw.png",
        cost: 15
    },
    T_N: {
        id: "T_N",
        connections: [true, true, false, true],   // N-E-W
        texture: "../../graphics/map/rails/rail_t_n.png",
        cost: 100
    },
    T_E: {
        id: "T_E",
        connections: [true, true, true, false],   // N-E-S
        texture: "../../graphics/map/rails/rail_t_e.png",
        cost: 100
    },
    T_S: {
        id: "T_S",
        connections: [false, true, true, true],   // E-S-W
        texture: "../../graphics/map/rails/rail_t_s.png",
        cost: 100
    },
    T_W: {
        id: "T_W",
        connections: [true, false, true, true],   // N-S-W
        texture: "../../graphics/map/rails/rail_t_w.png",
        cost: 200
    },
    CROSS: {
        id: "CROSS",
        connections: [true, true, true, true],
        texture: "../../graphics/map/rails/rail_cross.png",
        cost: 300
    }
};
export const DESTROY_ENTRY = {
    id: "DESTROY",
    connections: [false, false, false, false],
    isDestroy: true
};

//0=N, 1=E, 2=S, 3=W
export const OPPOSITE = [2, 3, 0, 1]; // N-S, E-W

export function canConnect(typeA, sideFromA) {
    if (!typeA.connections[sideFromA]) return false;
    return true;
}

export function railTypesCompatible(typeA, typeB, sideFromA) {
    const sideFromB = OPPOSITE[sideFromA];
    return typeA.connections[sideFromA] && typeB.connections[sideFromB];
}