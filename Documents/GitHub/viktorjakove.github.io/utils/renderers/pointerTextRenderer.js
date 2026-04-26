export function createPointerTextRenderer(app){
    const pointerContainer = new PIXI.Container();
    pointerContainer.zIndex = 20;
    app.stage.addChild(pointerContainer);

    let pointerText = null;
    let mousePosition = {x: 0, y: 0};
    let lastObstacle = null;

    function getPointerText(){
        if (!pointerText){
            pointerText = new PIXI.Text("", {
                fontFamily: "Arial",
                fontSize: 14,
                fill: 0x000000,
                backgroundColor: 0xffffff,
                padding: 4,
                align: "center"
            });
            pointerText.alpha = 0.8;
            pointerContainer.addChild(pointerText);
            pointerText.visible = false;
        }
        return pointerText;
    }

    function updatePointerText(text, screenX, screenY, gridScale){
        const pointerText = getPointerText();
        pointerText.text = text;
        
        pointerText.x = screenX / gridScale + 15 / gridScale;
        pointerText.y = screenY / gridScale + 10 / gridScale;
        
        pointerText.scale.set(1 / gridScale, 1 / gridScale);
        
        pointerText.visible = text.length > 0;
    }
    
    function togglePointerText(value) {
        // Tato funkce se dá případně použít jinde
    }

    function updateMousePosition(x, y, obstacleName) {
        mousePosition.x = x;
        mousePosition.y = y;
        lastObstacle = obstacleName;
    }

    function refresh(getGridScale) {
        const gridScale = getGridScale();
        const text = lastObstacle ? lastObstacle : "";
        
        updatePointerText(text, mousePosition.x, mousePosition.y, gridScale);
    }

    function clearText() {
        lastObstacle = null;
        const pointerText = getPointerText();
        pointerText.visible = false;
        pointerText.text = "";
    }

    return {
        updatePointerText,
        togglePointerText,
        updateMousePosition,
        refresh,
        clearText
    };
}

export function updatePointerTextRenderer(obstacleInfo, screenMouseX, screenMouseY, getGridScale) {
    if (window.pointerTextRenderer) {
        const text = obstacleInfo ? obstacleInfo : "";
        const gridScale = getGridScale();
        
        window.pointerTextRenderer.updatePointerText(text, screenMouseX, screenMouseY, gridScale);
        window.pointerTextRenderer.updateMousePosition(screenMouseX, screenMouseY, obstacleInfo);
    }
}