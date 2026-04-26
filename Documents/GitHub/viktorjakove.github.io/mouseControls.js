export function setupMouseControls(app, camera, getGridScale, cellSize, getPlacementMode, railRenderer, drawGraphics, getSelectedRailType, cityInfoOverlay, areas, stationRenderer, isCityUnlocked,unlockCity) {
    let isDragging = false;
    let mouseInitialPos = { x: 0, y: 0 };
    let isPlacingRail = false;

    function resetDrag() {
        isDragging = false;
    }

    function isOverlayVisible() {
        return cityInfoOverlay && cityInfoOverlay.isVisible && cityInfoOverlay.isVisible();
    }

    function getTileFromMouse(event){
        try{
            const gridScale = getGridScale();
            const worldX = camera.x + (event.data.global.x / gridScale) - app.screen.width / 2 / gridScale;
            const worldY = camera.y + (event.data.global.y / gridScale) - app.screen.height / 2 / gridScale;
            return {tileX: Math.floor(worldX / cellSize), tileY: Math.floor(worldY / cellSize)};
        }catch(error){
            console.error("Error v getTileFromMouse:", error);
            return null;
        }
    }

    function handleRailAction(tileX, tileY) {
        try{
            const selected = getSelectedRailType();
            
            if (selected.isDestroy) {
                if (railRenderer.isTileOccupied(tileX, tileY)) {
                    railRenderer.removeRail(tileX, tileY, false);
                    drawGraphics();
                }
                return;
            }
            if (!railRenderer.isTileOccupied(tileX, tileY)) {
                if (railRenderer.addRail(tileX, tileY, selected)) drawGraphics();
            }
        }catch(error){
            console.error("Error v handleRailAction:", error);
        }
    }

    function handleCityClick(tileX, tileY) {
        if (isOverlayVisible()) return false;
        
        const clickedCity = areas.find(area => 
            area.type?.type === "city" &&
            tileX >= area.x && tileX < area.x + area.sizeX &&
            tileY >= area.y && tileY < area.y + area.sizeY
        );

        if (clickedCity) {
            if (isCityUnlocked && isCityUnlocked(clickedCity.name)) {
                cityInfoOverlay.showCityInfo(clickedCity);
                return true;
            }
            
            const stations = stationRenderer.getStations();
            
            const isConnected = stations.some(station => {
                for (let x = clickedCity.x - 1; x <= clickedCity.x + clickedCity.sizeX; x++) {
                    for (let y = clickedCity.y - 1; y <= clickedCity.y + clickedCity.sizeY; y++) {
                        if (station.x === x && station.y === y) {
                            const otherStation = stations.find(s => 
                                s.index === station.index && 
                                (s.x !== station.x || s.y !== station.y)
                            );
                            if (otherStation) {
                                const connected = railRenderer.areStationsConnected(
                                    station.x, station.y,
                                    otherStation.x, otherStation.y
                                );
                                return connected;
                            }
                        }
                    }
                }
                return false;
            });
    
            if (isConnected) {
                //projistotu
                cityInfoOverlay.showCityInfo(clickedCity);
                return true;
            }

            if (isConnected) {
                if (unlockCity) {
                    unlockCity(clickedCity.name);
                }
                cityInfoOverlay.showCityInfo(clickedCity);
                return true;
            }
        }
        return false;
    }

    app.stage.on('pointerdown', (event) => {
        try{
            if (isOverlayVisible()) {
                event.stopPropagation();
                return;
            }

            const button = event.data.button;
            
            const tilePos = getTileFromMouse(event);
            if (!tilePos) return;
            
            if (button === 0 && !getPlacementMode()) {
                const cityClicked = handleCityClick(tilePos.tileX, tilePos.tileY);
                if (cityClicked) {
                    event.stopPropagation();
                    return;
                }
            }

            if (getPlacementMode() && button === 0) {
                isPlacingRail = true;
                handleRailAction(tilePos.tileX, tilePos.tileY);
                return;
            }

            if (getPlacementMode() ? (button === 2) : (button === 0 || button === 2)) {
                isDragging = true;
                mouseInitialPos = { x: event.data.global.x, y: event.data.global.y };
            }
        }catch(error){
            console.error("Error v pointerdown listener:", error);
        }
    });

    app.stage.on('pointerup', (event) => {
        if (isOverlayVisible()) return;

        const button = event.data.button;
        if (button === 0) isPlacingRail = false;
        if (getPlacementMode() ? (button === 2) : (button === 0 || button === 2)) {
            isDragging = false;
        }
    });

    app.stage.on('pointerupoutside', () => { 
        isDragging = false; 
        isPlacingRail = false; 
    });

    app.stage.on('pointermove', (event) => {
        try{
            if (isOverlayVisible()) return;

            if(getPlacementMode() && isPlacingRail){
                const tilePos = getTileFromMouse(event);
                if (tilePos) {
                    handleRailAction(tilePos.tileX, tilePos.tileY);
                }
                return;
            }

            if (isDragging) {
                const gridScale = getGridScale();
                const dx = (event.data.global.x - mouseInitialPos.x) / gridScale;
                const dy = (event.data.global.y - mouseInitialPos.y) / gridScale;
                camera.x -= dx;
                camera.y -= dy;
                mouseInitialPos = { x: event.data.global.x, y: event.data.global.y };
                drawGraphics();
            }
        }catch(error){
            console.error("Error v pointermove listener:", error);
        }
    });

    app.view.addEventListener("contextmenu", (event) => {
        if (isOverlayVisible()) {
            event.preventDefault();
        }
    });

    return { resetDrag };
}