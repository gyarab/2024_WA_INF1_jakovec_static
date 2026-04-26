import { AREA_GEN_DATA } from "./mapGenData/areaGenData.js";
import { ROUTES_DATA, ROUTE_COUNT_DATA, TUTORIAL_ROUTE_INDEXES } from "./mapGenData/routesData.js";
import { CITY_GEN_DATA } from "./mapGenData/cityGenData.js";
import { ColorGenerator } from "./utils/colorGenerator.js";
import { generateAreas } from "./generateAreas.js";
import { TUTORIAL_TEXTS } from "./text/tutorialTexts.js";

export function createStationManager(stationRenderer, areaRenderer, drawGraphics, getAreas, getLevel, setLevel, railRenderer, trainRenderer, unlockCity, characterOverlay, loadingOverlay) {
    let stationLevel = 0;
    const colorGen = new ColorGenerator({ sat: 0.6, light: 0.43 });
    const routeColors = new Map();
    
    const shownTutorials = new Set();

    function addLevel() {
        loadingOverlay.show();

        setTimeout(() => {
            console.log("adding level");
            const areas = getAreas();
            const level = getLevel() + 1;
            areas.push(...generateAreas(level, areas[areas.length - 1]));
            setLevel(level);
            areaRenderer.markDirty();
            stationRenderer.markDirty();

            loadingOverlay.hide();
        },100);
    }

    function showTutorial(routeIndex) {
        if (TUTORIAL_ROUTE_INDEXES.includes(routeIndex) && !shownTutorials.has(routeIndex)) {
            shownTutorials.add(routeIndex);
            
            const tutorial = TUTORIAL_TEXTS[routeIndex] || {
                title: "Nová stanice",
                texts: ["Úspěšně jsi vytvořil nové železniční spojení!"],
                instruction: "Pokračuj ve stavbě..."
            };
            
            const tutorialCity = {
                name: tutorial.title,
                building: "tutorial",
                texts: tutorial.texts,
                description: tutorial.texts[0],
                x: 0,
                y: 0,
                sizeX: 1,
                sizeY: 1,
                peeps: 0
            };
            
            if (characterOverlay && characterOverlay.showTutorial) {
                characterOverlay.showTutorial(tutorialCity, tutorial.instruction);
            } else {
                characterOverlay.showCityInfo(tutorialCity);
            }
        }
    }

    function addStations() {
        const areas = getAreas();
        const level = getLevel();
    
        let indexFirst = 0;
        for (let i = 0; i < stationLevel; i++) {
            indexFirst += ROUTE_COUNT_DATA[i];
        }
    
        const halfW = AREA_GEN_DATA.areaSize[level][0] / 2;
        const halfH = AREA_GEN_DATA.areaSize[level][1] / 2;
    
        let stationIndex = 0;
        for (let i = indexFirst; i < indexFirst + ROUTE_COUNT_DATA[stationLevel]; i++) {
            const cityA = CITY_GEN_DATA[ROUTES_DATA[i][0]].name;
            const cityB = CITY_GEN_DATA[ROUTES_DATA[i][1]].name;
    
            const routeColor = Math.floor(colorGen.next(), 0.5);
            routeColors.set(i, routeColor);
            const stationTiles = [];
    
            [cityA, cityB].forEach(cityName => {
                const cityArea = areas.find(a => a.name === cityName);
    
                const distToLeft   = cityArea.x + halfW;
                const distToRight  = halfW - (cityArea.x + cityArea.sizeX);
                const distToTop    = cityArea.y + halfH;
                const distToBottom = halfH - (cityArea.y + cityArea.sizeY);
                const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
    
                const blockedSides = {
                    left:   distToLeft   === minDist,
                    right:  distToRight  === minDist,
                    top:    distToTop    === minDist,
                    bottom: distToBottom === minDist,
                };
    
                const adjacentTiles = [];
                for (let tx = cityArea.x; tx < cityArea.x + cityArea.sizeX; tx++) {
                    if (!blockedSides.top)    adjacentTiles.push({ x: tx, y: cityArea.y - 1 });
                    if (!blockedSides.bottom) adjacentTiles.push({ x: tx, y: cityArea.y + cityArea.sizeY });
                }
                for (let ty = cityArea.y; ty < cityArea.y + cityArea.sizeY; ty++) {
                    if (!blockedSides.left)  adjacentTiles.push({ x: cityArea.x - 1, y: ty });
                    if (!blockedSides.right) adjacentTiles.push({ x: cityArea.x + cityArea.sizeX, y: ty });
                }
                adjacentTiles.sort(() => Math.random() - 0.5);
    
                const tile = adjacentTiles.find(t => !stationRenderer.isTileOccupied(t.x, t.y)) ?? adjacentTiles[0];
                stationRenderer.addStation(tile.x, tile.y, routeColor, stationIndex * 200, i, cityArea.peeps);
                if (railRenderer.isTileOccupied(tile.x, tile.y)) railRenderer.removeRail(tile.x, tile.y, false);
                stationTiles.push(tile);
                stationIndex++;
            });
    
            showTutorial(i);
            
            if (stationTiles.length === 2 && trainRenderer) {
                const path = railRenderer.getPath(
                    stationTiles[0].x, stationTiles[0].y,
                    stationTiles[1].x, stationTiles[1].y
                );
                if (path) {
                    trainRenderer.addTrain(path, routeColor, i, {
                        cityA: areas.find(a => a.name === cityA),
                        cityB: areas.find(a => a.name === cityB)
                    });
                }
            }
        }
    
        stationLevel++;
        drawGraphics();
    }

    function spawnTrainsForConnectedRoutes(connectedRouteIndices) {
        if (!trainRenderer) return;

        const stations = stationRenderer.getStations();
        const allRouteIndices = [...new Set(stations.map(s => s.index))];

        for (const routeIndex of allRouteIndices) {
            if (connectedRouteIndices.includes(routeIndex)) {
                if (trainRenderer.hasTrainForRoute(routeIndex)) continue;

                const pair = stations.filter(s => s.index === routeIndex);
                if (pair.length !== 2) continue;

                const [a, b] = pair;
                const path = railRenderer.getPath(a.x, a.y, b.x, b.y);
                if (!path) continue;

                const color = routeColors.get(routeIndex) ?? 0xffffff;
                trainRenderer.addTrain(path, color, routeIndex, [a.peeps, b.peeps]);
            } else {
                trainRenderer.removeTrainForRoute(routeIndex);
            }
        }
    }

    return { addLevel, addStations, spawnTrainsForConnectedRoutes };
}