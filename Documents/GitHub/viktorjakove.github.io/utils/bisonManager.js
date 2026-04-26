import { AREA_TYPES } from "../enums/areaTypes.js";

export function createBisonManager(app, getAreas, railRenderer, hudRenderer) {
    let bisonBuildingUnlocked = false;
    
    function unlockBisonBuilding() {
        bisonBuildingUnlocked = true;
        
        if (hudRenderer) hudRenderer.markDirty();
    }
    
    function isBisonUnlocked() {
        return bisonBuildingUnlocked;
    }
    
    function isTileOnBisonArea(tileX, tileY) {
        const areas = getAreas();
        return areas.some(area =>
            area.type === AREA_TYPES.BISONS &&
            tileX >= area.x && tileX < area.x + area.sizeX &&
            tileY >= area.y && tileY < area.y + area.sizeY
        );
    }
    
    function getBisonWarningText() {
        return "Bizoni - stavěním přes tuto oblast ztrácíš zisk!";
    }
    
    return {
        unlockBisonBuilding,
        isBisonUnlocked,
        isTileOnBisonArea,
        getBisonWarningText
    };
}