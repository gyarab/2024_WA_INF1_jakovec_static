export function createLoadingOverlay(app, getGridScale) {
    let container = null;
    let interval = null;
    let isVisible = false;

    function buildContent() {
        if (!container) return;
        container.removeChildren();
        
        const sw = app.screen.width;
        const sh = app.screen.height;

        const bg = new PIXI.Graphics();
        bg.beginFill(0x000000, 0.7);
        bg.drawRect(0, 0, sw, sh);
        bg.endFill();
        bg.interactive = true;
        container.addChild(bg);

        const panelW = 450, panelH = 200;
        const panel = new PIXI.Graphics();
        panel.beginFill(0x2c3e50, 0.95);
        panel.lineStyle(4, 0xf5c518);
        panel.drawRoundedRect(0, 0, panelW, panelH, 16);
        panel.endFill();
        panel.x = (sw - panelW) / 2;
        panel.y = (sh - panelH) / 2;
        container.addChild(panel);

        const text = new PIXI.Text(container._message || "Generuji mapu. Prosím čekejte.", {
            fontFamily: "Arial",
            fontSize: 22,
            fill: 0xf5c518,
            fontWeight: "bold",
            align: "center",
            wordWrap: true,
            wordWrapWidth: 410
        });
        text.anchor.set(0.5);
        text.x = sw / 2;
        text.y = sh / 2 - 30;
        container.addChild(text);

        const animText = new PIXI.Text("⏳", {
            fontFamily: "Arial",
            fontSize: 36,
            fill: 0xffffff
        });
        animText.anchor.set(0.5);
        animText.x = sw / 2;
        animText.y = sh / 2 + 40;
        container.addChild(animText);
    }

    function applyScale() {
        if (!container) return;
        const gs = getGridScale ? getGridScale() : 1;
        container.scale.set(1 / gs);
        container.x = 0;
        container.y = 0;
    }

    function show(message = "Generuji mapu. Prosím čekejte.") {
        if (isVisible) return;

        container = new PIXI.Container();
        container.zIndex = 1000;
        container._message = message;

        applyScale();
        buildContent();

        app.stage.addChild(container);

        let dots = 0;
        interval = setInterval(() => {
            if (!container) return;
            const animText = container.children[3];
            if (animText) {
                dots = (dots + 1) % 4;
                animText.text = "⏳" + ".".repeat(dots);
            }
        }, 300);

        isVisible = true;
    }

    function refresh() {
        if (!container || !isVisible) return;
        applyScale();
        buildContent();
    }

    function hide() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        if (container && container.parent) {
            app.stage.removeChild(container);
            container.destroy({ children: true });
            container = null;
        }
        isVisible = false;
    }

    return { show, hide, refresh, isVisible: () => isVisible };
}