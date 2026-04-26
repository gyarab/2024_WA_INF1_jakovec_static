/** 
    @param {string} app - pixi aplication
    @param {number} camera - camera object
    @param {number} gridScale - grid scale
    */
export const SCREEN_DIMENSIONS = (app,camera, gridScale,cellSize) => {
    const screenWidth = app.screen.width / gridScale;
    const screenHeight = app.screen.height / gridScale;
    const worldLeft = camera.x - screenWidth / 2; //leva strana obrazovky (pozice kamery x - polovina sirky obrazovky)
    const worldTop = camera.y - screenHeight / 2; //etc

    return {
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        worldLeft: worldLeft,
        worldRight: camera.x + screenWidth / 2,
        worldTop: worldTop,
        worldBottom: camera.y + screenHeight / 2,
        startX: Math.floor(worldLeft / cellSize) * cellSize, 
        startY: Math.floor(worldTop / cellSize) * cellSize,
    };
}