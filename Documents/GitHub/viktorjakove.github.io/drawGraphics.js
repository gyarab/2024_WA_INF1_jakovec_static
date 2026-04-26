import { SCREEN_DIMENSIONS } from "./screenDimensions.js";
import { AREA_GEN_DATA } from "./mapGenData/areaGenData.js";

export function createDrawGraphics(app, camera, getGridScale, cellSize, getLevel, getHighlightedTile, getPlacementMode, getAreas, renderers, fgContainer) {
    const { areaRenderer, stationRenderer, railRenderer, pointerTextRenderer, trainRenderer, hudRenderer} = renderers;

    const grid = new PIXI.Graphics();
    app.stage.addChild(grid);

    function drawHighlight(dimensions) {
        const highlightedTile = getHighlightedTile();
        if (highlightedTile) {
            const screenX = highlightedTile.x * cellSize - dimensions.worldLeft;
            const screenY = highlightedTile.y * cellSize - dimensions.worldTop;
            let tileColor = highlightedTile.obstacle ? highlightedTile.buildOverColor : 0xffcc00;
            grid.beginFill(tileColor, 0.5);
            grid.drawRect(screenX, screenY, cellSize, cellSize);
            grid.endFill();
        }
    }

    function drawGrid() {
        grid.clear();
        
        const dimensions = SCREEN_DIMENSIONS(app, camera, getGridScale(), cellSize);
    
        const occupiedTiles = railRenderer.getOccupiedTiles ? railRenderer.getOccupiedTiles() : [];
        
        occupiedTiles.forEach(tile => {
            const screenX = tile.x * cellSize - dimensions.worldLeft;
            const screenY = tile.y * cellSize - dimensions.worldTop;
            
            grid.beginFill(0x000000, 0.5);
            grid.drawRect(screenX, screenY, cellSize, cellSize);
            grid.endFill();
        });
    
        if (getPlacementMode()) {
            grid.lineStyle(1, 0x999999);
            for (let worldX = dimensions.startX; worldX <= dimensions.worldRight + cellSize; worldX += cellSize) {
                const screenX = worldX - dimensions.worldLeft;
                grid.moveTo(screenX, 0);
                grid.lineTo(screenX, dimensions.screenHeight);
            }
            for (let worldY = dimensions.startY; worldY <= dimensions.worldBottom + cellSize; worldY += cellSize) {
                const screenY = worldY - dimensions.worldTop;
                grid.moveTo(0, screenY);
                grid.lineTo(dimensions.screenWidth, screenY);
            }
    
            drawHighlight(dimensions);
        }
    
        // pointer infotext
        pointerTextRenderer.refresh(getGridScale);
    }

    function drawForeground() {
        const level = getLevel();
        const dimensions = SCREEN_DIMENSIONS(app, camera, getGridScale(), cellSize);
        fgContainer.removeChildren();

        const fgMapEdge = new PIXI.Graphics();
        fgMapEdge.beginFill(0xd3d3d3);
        fgMapEdge.drawRect(0, 0, dimensions.screenWidth, dimensions.screenHeight);
        fgContainer.addChild(fgMapEdge);

        const holeWidth = AREA_GEN_DATA.areaSize[level][0] * cellSize;
        const holeHeight = AREA_GEN_DATA.areaSize[level][1] * cellSize;
        const holeStartX = -holeWidth / 2;
        const holeStartY = -holeHeight / 2;
        const holeEndX = holeWidth / 2;
        const holeEndY = holeHeight / 2;

        const screenHoleStartX = holeStartX - dimensions.worldLeft;
        const screenHoleStartY = holeStartY - dimensions.worldTop;
        const screenHoleEndX = holeEndX - dimensions.worldLeft;
        const screenHoleEndY = holeEndY - dimensions.worldTop;

        const isOverlapping = screenHoleEndX > 0 && screenHoleStartX < dimensions.screenWidth &&
            screenHoleEndY > 0 && screenHoleStartY < dimensions.screenHeight;

        if (isOverlapping) {
            const bgMask = new PIXI.Graphics();
            bgMask.beginFill(0x000000);
            bgMask.drawRect(0, 0, dimensions.screenWidth, dimensions.screenHeight);
            bgMask.beginHole();
            bgMask.drawRect(
                Math.max(0, screenHoleStartX), Math.max(0, screenHoleStartY),
                Math.min(dimensions.screenWidth, screenHoleEndX) - Math.max(0, screenHoleStartX),
                Math.min(dimensions.screenHeight, screenHoleEndY) - Math.max(0, screenHoleStartY)
            );
            bgMask.endHole();
            bgMask.endFill();
            fgContainer.mask = bgMask;
            fgContainer.addChild(bgMask);
        } else {
            fgContainer.mask = null;
        }

        app.stage.addChild(fgContainer);
    }

    function drawGraphics() {
        drawGrid();
        areaRenderer.drawAreas(getAreas());
        stationRenderer.drawStations();
        railRenderer.drawRails();
        if (trainRenderer) trainRenderer.drawTrains();
        hudRenderer.draw();
        drawForeground();
    }

    return { drawGraphics, grid };
}