import { AREA_TYPES } from "../enums/areaTypes.js";
import {updatePointerTextRenderer} from "./renderers/pointerTextRenderer.js";
import {getShiftPressed} from "./shiftState.js";
export function setupTileHighlight(app, camera, getGridScale, cellSize, drawGraphics, areas, getPlacementMode, bisonManager, railRenderer, getSelectedRailType) {
    let highlightedTile = null;

    app.view.addEventListener("mousemove", (event) => {
        try {
            const gridScale = getGridScale(); 
            const shiftPressed = getShiftPressed();
            const placementMode = getPlacementMode();
            const selectedRailType = getSelectedRailType ? getSelectedRailType() : null;

            const mouseX = event.clientX - app.screen.width / 2;
            const mouseY = event.clientY - app.screen.height / 2;

            const worldMouseX = camera.x + mouseX / gridScale;
            const worldMouseY = camera.y + mouseY / gridScale;

            const tileX = Math.floor(worldMouseX / cellSize);
            const tileY = Math.floor(worldMouseY / cellSize);

            let obstacleInfo = "";
            let obstacle = null;
            let isCompatible = true;
            
            const isOnBison = areas.some(area => 
                area.type === AREA_TYPES.BISONS &&
                tileX >= area.x && tileX < area.x + area.sizeX &&
                tileY >= area.y && tileY < area.y + area.sizeY
            );
            
            if (isOnBison && placementMode && bisonManager && bisonManager.isBisonUnlocked()) {
                obstacleInfo = "Bizoni - stavěním přes tuto oblast ztrácíš zisk!";
                obstacle = { type: AREA_TYPES.BISONS, buildOverInfo: obstacleInfo };
            }

            const isOccupied = areas.some(placedArea => {
                let within = tileX >= placedArea.x &&
                tileX < placedArea.x + placedArea.sizeX &&
                tileY >= placedArea.y &&
                tileY < placedArea.y + placedArea.sizeY &&
                placedArea.type != AREA_TYPES.LOCK;

                if (within && !isOnBison) {
                    if (shiftPressed && (placedArea.type === AREA_TYPES.CITY || placedArea.type === AREA_TYPES.LAKE || 
                        placedArea.type === AREA_TYPES.INDIANS || placedArea.type === AREA_TYPES.FOREST || 
                        placedArea.type === AREA_TYPES.ROCK)) {
                        obstacleInfo = placedArea.description;
                        return true;
                    } else if(placementMode && (placedArea.type === AREA_TYPES.FOREST || placedArea.type === AREA_TYPES.ROCK || 
                        placedArea.type === AREA_TYPES.INDIANS)) {
                        obstacle = placedArea.type;
                        obstacleInfo = obstacle.buildOverCost ? "+"+obstacle.buildOverCost + "$" : obstacle.buildOverInfo;
                        return true;
                    }
                    return true;
                }
                return false;
            });

            if (placementMode && selectedRailType && !selectedRailType.isDestroy && !isOccupied && !isOnBison) {
                if (!railRenderer.isTileOccupied(tileX, tileY)) {
                    
                    isCompatible = railRenderer.isCompatibleWithNeighbors(tileX, tileY, selectedRailType);
                    
                    if (!isCompatible) {
                        obstacleInfo = "Nekompatibilní spojení!";
                    }
                }
            }

            updatePointerTextRenderer(obstacleInfo, event.clientX, event.clientY, getGridScale);

            if (!isOccupied && !isOnBison && isCompatible) {
                highlightedTile = { x: tileX, y: tileY, obstacle: obstacle };
            } else if (isOnBison || !isCompatible) {
                highlightedTile = { 
                    x: tileX, 
                    y: tileY, 
                    obstacle: obstacle,
                    isBison: isOnBison,
                    buildOverColor: !isCompatible ? 0xff0000 : 0xffaa00
                };
            } else {
                highlightedTile = null;
            }

            drawGraphics();
        } catch (error) {
            console.error("Error in mousemove listener:", error);
        }
    });

    return {
        getHighlightedTile: () => highlightedTile,
    };
}