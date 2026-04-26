import { createAreaRenderer } from "../renderers/areaRenderer.js";
import { createStationRenderer } from "../renderers/stationRenderer.js";
import { createRailRenderer } from "../renderers/railRenderer.js";
import { createPointerTextRenderer } from "../renderers/pointerTextRenderer.js";
import { createTrainRenderer } from "../renderers/trainRenderer.js";
import { createHUDRenderer } from "../renderers/hudRenderer.js";

// init - PŘIDÁME PARAMETR getLoanTimerInfo
export function creatRenderers(
    app, 
    camera, 
    getGridScale, 
    cellSize, 
    getAreas, 
    getLevel, 
    addMoney, 
    subMoney, 
    getMoney, 
    getPlacementMode, 
    getRelations, 
    setRelations,
    getLoanTimerInfo
) {
    
    // pointer hint
    const pointerTextRenderer = createPointerTextRenderer(app);
    window.pointerTextRenderer = pointerTextRenderer;

    // areas
    const areaRenderer = createAreaRenderer(app, camera, getGridScale, cellSize, getPlacementMode);
    // stations
    const stationRenderer = createStationRenderer(app, camera, getGridScale, cellSize);
    // rails
    const railRenderer = createRailRenderer(app, camera, getGridScale, cellSize, getAreas, getLevel, getMoney, addMoney, subMoney, getRelations, setRelations,areaRenderer);
    // trains
    const trainRenderer = createTrainRenderer(app, camera, getGridScale, cellSize, addMoney, railRenderer.getBisonProfit);

    // HUD - getLoanTimerInfo
    const hudRenderer = createHUDRenderer(app, getGridScale, getMoney, getPlacementMode, getLoanTimerInfo);

    return { areaRenderer, stationRenderer, railRenderer, pointerTextRenderer, trainRenderer, hudRenderer };
}