export function createRouteChecker(stationRenderer, railRenderer) {
    function checkRouteConnections() {
        const stations = stationRenderer.getStations();

        const routeMap = new Map();
        for (const station of stations) {
            if (!routeMap.has(station.index)) routeMap.set(station.index, []);
            routeMap.get(station.index).push(station);
        }

        const results = [];
        for (const [routeIndex, pair] of routeMap.entries()) {
            if (pair.length !== 2) continue;
            const [a, b] = pair;
            const connected = railRenderer.areStationsConnected(a.x, a.y, b.x, b.y);
            results.push({ routeIndex, connected });
        }
        return results;
    }

    return { checkRouteConnections };
}