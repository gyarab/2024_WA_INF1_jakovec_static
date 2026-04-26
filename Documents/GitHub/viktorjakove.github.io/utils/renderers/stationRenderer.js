import { SCREEN_DIMENSIONS } from "../../screenDimensions.js";

export function createStationRenderer(app, camera, getGridScale, cellSize) {
    const stationContainer = new PIXI.Container();
    stationContainer.zIndex = 2;
    app.stage.addChild(stationContainer);

    const labelContainer = new PIXI.Container();
    labelContainer.zIndex = 12;
    app.stage.addChild(labelContainer);

    const stations = [];
    const graphicsPool = [];
    const textPool = [];
    let shiftPressed = false;

    let stationDirty = true;
    let lastCameraPos = { x: 0, y: 0 };
    let lastGridScale = 1;

    function getPooledGraphics() {
        return graphicsPool.pop() || new PIXI.Graphics();
    }

    function returnGraphics(graphics) {
        graphics.clear();
        graphicsPool.push(graphics);
    }

    function getPooledText() {
        const text = textPool.pop() || new PIXI.Text('');
        //reset
        text.text = '';
        text.style = {};
        text.anchor.set(0);
        text.scale.set(1);
        return text;
    }

    function returnText(text) {
        textPool.push(text);
    }

    function setShiftPressed(value) {
        if (shiftPressed !== value) {
            shiftPressed = value;
            stationDirty = true;
        }
    }

    function markDirty() {
        stationDirty = true;
    }

    function addStation(tileX, tileY, color, delay, routeIndex, peeps) {
        stations.push({ x: tileX, y: tileY, color, alpha: 0, delay, index: routeIndex, peeps});
        stationDirty = true;
    }

    function isTileOccupied(tileX, tileY) {
        return stations.some(s => s.x === tileX && s.y === tileY);
    }

    app.ticker.add(() => {
        let anyFading = false;
        for (const station of stations) {
            if (station.delay > 0) {
                station.delay -= app.ticker.deltaMS;
                anyFading = true;
                continue;
            }
            if (station.alpha < 0.7) {
                station.alpha = Math.min(0.7, station.alpha + 0.05);
                anyFading = true;
            }
        }
        if (anyFading) {
            stationDirty = true;
            drawStations();
        }
    });

    function drawStations() {
        const gridScale = getGridScale();
        const cameraChanged = camera.x !== lastCameraPos.x || camera.y !== lastCameraPos.y;
        const scaleChanged = gridScale !== lastGridScale;

        if (!stationDirty && !cameraChanged && !scaleChanged) {
            return;
        }

        while (stationContainer.children.length > 0) {
            returnGraphics(stationContainer.removeChildAt(0));
        }
        while (labelContainer.children.length > 0) {
            returnText(labelContainer.removeChildAt(0));
        }

        const dimensions = SCREEN_DIMENSIONS(app, camera, gridScale, cellSize);

        for (const station of stations) {
            const screenX = station.x * cellSize - dimensions.worldLeft;
            const screenY = station.y * cellSize - dimensions.worldTop;

            const g = getPooledGraphics();
            g.beginFill(station.color, station.alpha);
            g.drawRect(screenX, screenY, cellSize, cellSize);
            g.endFill();
            stationContainer.addChild(g);

            if (shiftPressed) {
                const label = getPooledText();
                label.text = String(station.index);
                label.style = {
                    fontFamily: "Arial",
                    fontSize: 14,
                    fill: 0xffffff,
                    align: "center",
                    fontWeight: "bold",
                };
                label.anchor.set(0.5);
                label.x = screenX + cellSize / 2;
                label.y = screenY + cellSize / 2;
                label.scale.set(1 / gridScale, 1 / gridScale);
                labelContainer.addChild(label);
            }
        }

        lastCameraPos = { x: camera.x, y: camera.y };
        lastGridScale = gridScale;
        stationDirty = false;
    }

    function loadStations(data){
        stations.length = 0;
        for (const s of data){
            stations.push({x: s.x, y: s.y, color: s.color, alpha: 0.7, delay: 0, index: s.index});
        }
    }
    function getStations(){
        return stations.map(s => ({x: s.x, y: s.y, color: s.color, index: s.index, peeps :s.peeps}));
    }

    return { addStation, drawStations, isTileOccupied, setShiftPressed, markDirty, loadStations, getStations };
}