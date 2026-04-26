import { generateAreas } from "./generateAreas.js";
import { keyboardControls } from "./utils/keyboardHandler.js";
import { setupTileHighlight } from "./utils/highlightTile.js";
import { createApp } from "./utils/setup/appSetup.js";
import { createCamera, createZoomValues } from "./camera.js";
import { creatRenderers } from "./utils/setup/renderersSetup.js";
import { createDrawGraphics } from "./drawGraphics.js";
import { setupMouseControls } from "./mouseControls.js";
import { createStationManager } from "./stationManager.js";
import { createRouteChecker } from "./utils/routeChecker.js";
import { createCharacterOverlay } from "./utils/renderers/characterOverlay/characterOverlayRenderer.js";
import { createBankManager } from "./utils/bankManager.js";
import { createBisonManager } from "./utils/bisonManager.js";
import { createBisonProfitStore } from "./createBisonProfitStore.js";
import { createBuildingSpritesManager } from "./buildingSprites.js";
import { getShiftPressed } from "./utils/shiftState.js";
import { createLoadingOverlay } from "./utils/renderers/loadingOverLay.js";
import { createWelcomeScreen } from "./welcomeScreen.js";

const app = createApp();

app.view.style.display = 'none';

app.stage.sortableChildren = true;

const camera = createCamera();

const { gridScale: initScale, zoomSpeed, minScale, maxScale } = createZoomValues();
let gridScale = initScale;
const cellSize = 50;

let level = 0;
let placementMode = false;

let money = 1000;
let relations = 1;

let areas = [];

const getGridScale = () => gridScale;
const getPlacementMode = () => placementMode;
const getLevel = () => level;
const setLevel = (value) => level = value;
const getAreas = () => areas;
const getRelations = () => relations;
const setRelations = (value) => relations = value;
const getMoney = () => money;
const subMoney = (amount) => money -= amount;
const addMoney = (amount) => money += amount;

let unlockedCities = new Set();

const getUnlockedCities = () => unlockedCities;

const renderers = creatRenderers(
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
    () => {
        if (window.bankManager) {
            return {
                isActive: window.bankManager.isLoanActive ? window.bankManager.isLoanActive() : false,
                formattedTime: window.bankManager.getFormattedTime ? window.bankManager.getFormattedTime() : "0:00"
            };
        }
        return { isActive: false, formattedTime: "0:00" };
    }
);

const { areaRenderer, stationRenderer, railRenderer, pointerTextRenderer, trainRenderer, hudRenderer } = renderers;

window.trainRenderer = trainRenderer;
window.hudRenderer = hudRenderer;

const bisonManager = createBisonManager(app, getAreas, railRenderer, hudRenderer);
window.bisonManager = bisonManager;
const bisonProfitStore = createBisonProfitStore();
window.bisonProfitStore = bisonProfitStore;

const loadingOverLay = createLoadingOverlay(app, getGridScale);

function onLoanExpired(expiredAmount, seizedMoney, remainingDebt) {
    if (hudRenderer) hudRenderer.markDirty();
}

const bankManager = createBankManager(
    app,
    getMoney,
    addMoney,
    subMoney,
    onLoanExpired,
    railRenderer,
    () => hudRenderer.markDirty()
);

window.bankManager = bankManager;
bankManager.reset();

const characterOverlay = createCharacterOverlay(app, getGridScale, railRenderer, stationRenderer, getMoney, subMoney, addMoney);

const buildingSpritesManager = createBuildingSpritesManager(app, camera, getGridScale, cellSize, characterOverlay, getShiftPressed, getPlacementMode);
window.buildingSpritesManager = buildingSpritesManager;

const fgContainer = new PIXI.Container();
fgContainer.zIndex = 10;

const drawGraphicsInstance = createDrawGraphics(app, camera, getGridScale, cellSize, getLevel, () => null, getPlacementMode, getAreas, renderers, fgContainer);
let drawGraphics = drawGraphicsInstance.drawGraphics;

const { addLevel, addStations, spawnTrainsForConnectedRoutes } = createStationManager(
    stationRenderer, 
    areaRenderer, 
    drawGraphics, 
    getAreas, 
    getLevel, 
    setLevel, 
    railRenderer, 
    trainRenderer, 
    (cityName) => {
        if (unlockedCities.has(cityName)) return;
        unlockedCities.add(cityName);
        
        const city = areas.find(a => a.name === cityName);
        if (city && city.building !== "none") {
            buildingSpritesManager.createSprite(city);
        }
    },
    characterOverlay,
    loadingOverLay
);

const { checkRouteConnections } = createRouteChecker(stationRenderer, railRenderer);

function findCityByStation(stationX, stationY, areas) {
    return areas.find(area => 
        area.type?.type === "city" &&
        stationX >= area.x - 1 && stationX <= area.x + area.sizeX &&
        stationY >= area.y - 1 && stationY <= area.y + area.sizeY
    );
}

const isCityUnlocked = (cityName) => unlockedCities.has(cityName);

railRenderer.setOnRailPlaceCheckConn(() => {
    const result = checkRouteConnections();

    const connectedIndices = result.filter(r => r.connected).map(r => r.routeIndex);
    spawnTrainsForConnectedRoutes(connectedIndices);

    const stations = stationRenderer.getStations();
    const areas = getAreas();

    connectedIndices.forEach(index => {
        const pair = stations.filter(s => s.index === index);
        if (pair.length === 2) {
            const city1 = findCityByStation(pair[0].x, pair[0].y, areas);
            const city2 = findCityByStation(pair[1].x, pair[1].y, areas);
            
            if (city1 && !isCityUnlocked(city1.name)) {
                if (!unlockedCities.has(city1.name)) {
                    unlockedCities.add(city1.name);
                    if (city1.building !== "none") {
                        buildingSpritesManager.createSprite(city1);
                    }
                }
            }
            if (city2 && !isCityUnlocked(city2.name)) {
                if (!unlockedCities.has(city2.name)) {
                    unlockedCities.add(city2.name);
                    if (city2.building !== "none") {
                        buildingSpritesManager.createSprite(city2);
                    }
                }
            }
            
            if(getLevel() === 0 && index === 5) {
                addLevel();
                console.log("Level up!");
            }
        }
    });

    const allConnected = result.length > 0 && result.every(r => r.connected);
    if (allConnected) addStations();
});

const originalDrawGraphics = drawGraphics;
function enhancedDrawGraphics() {
    originalDrawGraphics();
    buildingSpritesManager.updatePositions();
}

drawGraphics = enhancedDrawGraphics;

const { resetDrag } = setupMouseControls(
    app, 
    camera, 
    getGridScale, 
    cellSize, 
    getPlacementMode, 
    railRenderer, 
    () => drawGraphics(), 
    () => hudRenderer.getSelectedType(),
    characterOverlay,
    areas,
    stationRenderer,
    isCityUnlocked,
    (cityName) => {
        if (unlockedCities.has(cityName)) return;
        unlockedCities.add(cityName);
        
        const city = areas.find(a => a.name === cityName);
        if (city && city.building !== "none") {
            buildingSpritesManager.createSprite(city);
        }
    }
);

document.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && characterOverlay.isVisible()) {
        characterOverlay.hideOverlay();
    }
});

app.view.addEventListener("wheel", (event) => {
    if (characterOverlay.isVisible && characterOverlay.isVisible()) {
        event.preventDefault();
        return;
    }
    
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    mapZoom(zoomFactor, event);
});

function updateStageHitArea() {
    app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width / gridScale, app.screen.height / gridScale);
}

function mapZoom(zoomFactor, event) {
    const newScale = Math.min(maxScale, Math.max(minScale, gridScale * zoomFactor));
    
    if (event) {
        const mouseX = event.clientX - app.screen.width / 2;
        const mouseY = event.clientY - app.screen.height / 2;
        const worldMouseX = camera.x + mouseX / gridScale;
        const worldMouseY = camera.y + mouseY / gridScale;
        
        camera.x = worldMouseX - mouseX / newScale;
        camera.y = worldMouseY - mouseY / newScale;
    }

    gridScale = newScale;
    app.stage.scale.set(gridScale, gridScale);
    updateStageHitArea();
    areaRenderer.markDirty();
    stationRenderer.markDirty();
    railRenderer.markDirty();

    pointerTextRenderer.refresh(() => gridScale);
    hudRenderer.draw();
    characterOverlay.refresh();
    buildingSpritesManager.refresh();
    loadingOverLay.refresh();
    
    drawGraphics();
}

window.addEventListener("resize", () => {
    const oldWidth = app.screen.width;
    const oldHeight = app.screen.height;
    
    app.renderer.resize(window.innerWidth, window.innerHeight);
    
    const newWidth = app.screen.width;
    const newHeight = app.screen.height;
    
    const widthDiff = (newWidth - oldWidth) / 2 / gridScale;
    const heightDiff = (newHeight - oldHeight) / 2 / gridScale;
    
    camera.x -= widthDiff;
    camera.y -= heightDiff;
    
    updateStageHitArea();
    areaRenderer.markDirty();
    stationRenderer.markDirty();
    railRenderer.markDirty();
    hudRenderer.markDirty();
    if (trainRenderer) trainRenderer.markDirty();
    buildingSpritesManager.refresh();
    drawGraphics();
    if (characterOverlay.isVisible && characterOverlay.isVisible()) {
        const currentCity = characterOverlay.getCurrentCity ? characterOverlay.getCurrentCity() : null;
        if (currentCity) {
            characterOverlay.refresh();
        }
    }
    loadingOverLay.refresh();
});

const keyboardMapMovement = keyboardControls(camera, zoomSpeed, gridScale, mapZoom, drawGraphics, addLevel, addStations, { get placementMode() { return placementMode; }, set placementMode(value) { placementMode = value; } }, areaRenderer, pointerTextRenderer, resetDrag, stationRenderer, hudRenderer, characterOverlay);

app.ticker.add(() => {
    keyboardMapMovement();
});

function initGame(isNewGame = true) {
    if (isNewGame) {
        areas = generateAreas(0, null);
        money = 1000;
        level = 0;
        relations = 1;
        unlockedCities = new Set();
        placementMode = false;
        camera.x = 0;
        camera.y = 0;
        gridScale = initScale;
        
        if (railRenderer) {
            railRenderer.getRails().forEach(r => railRenderer.removeRail(r.x, r.y, false));
        }
        if (trainRenderer) trainRenderer.clearTrains();
        if (stationRenderer) stationRenderer.loadStations([]);
        if (buildingSpritesManager) buildingSpritesManager.clearAll();
        if (bankManager) bankManager.reset();
        if (bisonProfitStore) {
            while (bisonProfitStore.getStoredProfit() > 0) {
                bisonProfitStore.withdrawProfit(() => {});
            }
        }
        
        areaRenderer.markDirty();
        stationRenderer.markDirty();
        railRenderer.markDirty();
        hudRenderer.markDirty();

        console.log("jeho prvni nadr");
        addStations();
    }
    
    const { getHighlightedTile } = setupTileHighlight(
        app, camera, () => gridScale, cellSize, () => drawGraphics(), 
        areas, getPlacementMode, bisonManager, railRenderer, 
        () => hudRenderer.getSelectedType(), characterOverlay, getUnlockedCities
    );
    
    const newDrawGraphicsInstance = createDrawGraphics(
        app, camera, getGridScale, cellSize, getLevel, 
        getHighlightedTile, getPlacementMode, getAreas, renderers, fgContainer
    );
    window.drawGraphics = newDrawGraphicsInstance.drawGraphics;
    
    const newOriginalDraw = window.drawGraphics;
    window.drawGraphics = function() {
        newOriginalDraw();
        buildingSpritesManager.updatePositions();
    };

    app.view.style.display = 'block';
    window.drawGraphics();
}

const spriteButtons = [
    {
        path: '../../graphics/corp/instagram.webp',
        alt: 'Instagram',
        onClick: () => {
            window.open('https://www.instagram.com/viktorjakove/', '_blank');
        }
    },
    {
        path: '../../graphics/corp/itch.png',
        alt: 'itch.io',
        onClick: () => {
            window.open('https://bagr-viktor.itch.io/', '_blank');
        }
    }
];

const welcomeScreen = createWelcomeScreen(
    () => {
        initGame(true);
    },
    spriteButtons
);