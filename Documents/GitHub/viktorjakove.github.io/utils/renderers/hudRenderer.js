import { RAIL_TYPES, DESTROY_ENTRY } from "../../enums/railTypes.js";

const TYPES_LIST = [...Object.values(RAIL_TYPES), DESTROY_ENTRY];

export function createHUDRenderer(app, getGridScale, getMoney, getPlacementMode, getLoanTimerInfo) {
    const LOCKED_RAIL_TYPES = new Set(["T_N", "T_E", "T_S", "T_W"]);
    
    function unlockRailType(typeId) {
        LOCKED_RAIL_TYPES.delete(typeId);
        
        const availableTypes = TYPES_LIST.filter(type => {
            if (type.isDestroy) return true;
            return !LOCKED_RAIL_TYPES.has(type.id);
        });
        
        const selected = availableTypes.find(t => t.id === selectedTypeId);
        if (!selected && availableTypes.length > 0) {
            selectedTypeId = availableTypes[0].id;
        }
        
        hudDirty = true;
        draw();
    }

    const topBarContainer = new PIXI.Container();
    topBarContainer.zIndex = 25;
    topBarContainer.interactive = true;
    app.stage.addChild(topBarContainer);

    const TOP_BAR_H = 48;
    const TOP_BAR_FONT = 18;

    let lastTimerString = "";

    function drawTopBar() {
        topBarContainer.removeChildren();

        const gridScale = getGridScale();
        const w = app.screen.width;

        const bg = new PIXI.Graphics();
        bg.beginFill(0x222222, 0.88);
        bg.drawRect(0, 0, w, TOP_BAR_H);
        bg.endFill();
        topBarContainer.addChild(bg);

        const money = getMoney();
        const moneyLabel = new PIXI.Text(`💰 $${money}`, {
            fontFamily: "Arial",
            fontSize: TOP_BAR_FONT,
            fontWeight: "bold",
            fill: 0xf5c518,
        });
        moneyLabel.x = 12;
        moneyLabel.y = TOP_BAR_H / 2 - TOP_BAR_FONT / 2;
        topBarContainer.addChild(moneyLabel);
        
        if (getLoanTimerInfo) {
            try {
                const timerInfo = getLoanTimerInfo();
                if (timerInfo && timerInfo.isActive) {
                    lastTimerString = timerInfo.formattedTime;
                    
                    const timeParts = timerInfo.formattedTime.split(':');
                    const minutes = parseInt(timeParts[0]) || 0;
                    const seconds = parseInt(timeParts[1]) || 0;
                    const totalSeconds = minutes * 60 + seconds;
                    
                    const loanAmount = window.bankManager?.getLoanAmount?.() || 0;
                    const isOverdue = totalSeconds <= 0;
                    
                    const timerContainer = new PIXI.Container();
                    
                    let timerColor = 0xf5c518;
                    let timerText = timerInfo.formattedTime;
                    
                    if (isOverdue) {
                        timerColor = 0xe74c3c;
                        timerText = `⛓️ PO SPLATNOSTI ⛓️`;
                    } else if (totalSeconds < 60) {
                        timerColor = 0xe74c3c;
                    } else if (totalSeconds < 120) {
                        timerColor = 0xe67e22;
                    } else if (totalSeconds < 180) {
                        timerColor = 0xf39c12;
                    } else if (totalSeconds < 240) {
                        timerColor = 0xf1c40f;
                    }
                    
                    const timerLabel = new PIXI.Text(`⏱️ ${timerText}`, {
                        fontFamily: "Arial",
                        fontSize: TOP_BAR_FONT + 2,
                        fontWeight: "bold",
                        fill: timerColor,
                    });
                    timerLabel.anchor.set(0.5, 0);
                    timerLabel.x = w / 2;
                    timerLabel.y = TOP_BAR_H / 2 - TOP_BAR_FONT / 2 - 10;
                    timerContainer.addChild(timerLabel);
                    
                    if (loanAmount > 0) {
                        const debtLabel = new PIXI.Text(`Dluh: $${loanAmount}`, {
                            fontFamily: "Arial",
                            fontSize: TOP_BAR_FONT - 2,
                            fontWeight: "bold",
                            fill: 0xe74c3c,
                        });
                        debtLabel.anchor.set(0.5, 0);
                        debtLabel.x = w / 2;
                        debtLabel.y = TOP_BAR_H / 2 - TOP_BAR_FONT / 2 + 12;
                        timerContainer.addChild(debtLabel);
                    }
                    
                    topBarContainer.addChild(timerContainer);
                }
            } catch (error) {
                console.error("Chyba při zobrazování časovače:", error);
            }
        }

        topBarContainer.scale.set(1 / gridScale);
        topBarContainer.x = 0;
        topBarContainer.y = 0;
    }

    const leftBarContainer = new PIXI.Container();
    leftBarContainer.zIndex = 25;
    leftBarContainer.interactive = true;
    app.stage.addChild(leftBarContainer);

    const ICON_SIZE = 48;
    const PADDING = 6;

    let selectedTypeId = "STRAIGHT_H";
    let onSelectCallback = null;

    let hudDirty = true;
    let lastMoney = null;
    let lastPlacementMode = null;
    let lastGridScale = null;
    let lastTimerInfo = null;

    let lastSecond = Date.now();
    
    function updateTimer() {
        const now = Date.now();
        if (now - lastSecond >= 1000) {
            lastSecond = now;
            if (getLoanTimerInfo) {
                const timerInfo = getLoanTimerInfo();
                if (timerInfo && timerInfo.isActive) {
                    if (timerInfo.formattedTime !== lastTimerString) {
                        hudDirty = true;
                        draw();
                    }
                } else {
                    if (lastTimerInfo?.isActive) {
                        hudDirty = true;
                        draw();
                    }
                }
            }
        }
    }

    app.ticker.add(updateTimer);

    function getSelectedType() {
        const availableTypes = TYPES_LIST.filter(type => {
            if (type.isDestroy) return true;
            return !LOCKED_RAIL_TYPES.has(type.id);
        });
        
        let selected = availableTypes.find(t => t.id === selectedTypeId);
        
        if (!selected && availableTypes.length > 0) {
            selectedTypeId = availableTypes[0].id;
            selected = availableTypes[0];
        }
        
        if (!selected) {
            selected = TYPES_LIST[0];
            if (selected) selectedTypeId = selected.id;
        }
        
        return selected || TYPES_LIST[0];
    }

    function setOnSelect(cb) {
        onSelectCallback = cb;
    }

    function drawLeftBar() {
        leftBarContainer.removeChildren();

        leftBarContainer.visible = getPlacementMode();
        
        if (!getPlacementMode()) {
            return;
        }

        const gridScale = getGridScale();

        const PANEL_W = ICON_SIZE + PADDING * 2;
        const PANEL_H = TYPES_LIST.length * (ICON_SIZE + PADDING + 10) + PADDING;

        const bg = new PIXI.Graphics();
        bg.beginFill(0x222222, 0.88);
        bg.drawRect(0, 0, PANEL_W, PANEL_H, 8);
        bg.endFill();
        bg.interactive = true;
        leftBarContainer.addChild(bg);

        TYPES_LIST.forEach((type, i) => {
            const x = PADDING;
            const y = PADDING + i * (ICON_SIZE + PADDING + 10);

            const isLocked = !type.isDestroy && LOCKED_RAIL_TYPES.has(type.id);
            
            const isSelected = !isLocked && type.id === selectedTypeId;

            if (isSelected) {
                const hl = new PIXI.Graphics();
                hl.beginFill(0xffcc00, 0.55);
                hl.drawRoundedRect(x, y, ICON_SIZE, ICON_SIZE, 4);
                hl.endFill();
                leftBarContainer.addChild(hl);
            }

            if (type.isDestroy) {
                const g = new PIXI.Graphics();
                g.beginFill(0xaa0000, 0.9);
                g.drawRect(x + 2, y + 2, ICON_SIZE - 4, ICON_SIZE - 4);
                g.endFill();
                g.lineStyle(3, 0xffffff);
                g.moveTo(x + 10, y + 10);
                g.lineTo(x + ICON_SIZE - 10, y + ICON_SIZE - 10);
                g.moveTo(x + ICON_SIZE - 10, y + 10);
                g.lineTo(x + 10, y + ICON_SIZE - 10);
                leftBarContainer.addChild(g);
                const sellLabel = new PIXI.Text("PRODAT", {
                    fontFamily: "Arial",
                    fontSize: 12,
                    fill: 0xff6666,
                    align: "center",
                    fontWeight: "bold",
                });
                sellLabel.anchor.set(0.5, 0);
                sellLabel.x = x + ICON_SIZE / 2;
                sellLabel.y = y + ICON_SIZE + 2;
                leftBarContainer.addChild(sellLabel);
            } else {
                try {
                    const sprite = new PIXI.Sprite(PIXI.Texture.from(type.texture));
                    sprite.x = x;
                    sprite.y = y;
                    sprite.width = ICON_SIZE;
                    sprite.height = ICON_SIZE;
                    leftBarContainer.addChild(sprite);
                } catch {
                    const g = new PIXI.Graphics();
                    g.lineStyle(2, 0xffffff);
                    g.drawRect(x + 2, y + 2, ICON_SIZE - 4, ICON_SIZE - 4);
                    const cx = x + ICON_SIZE / 2;
                    const cy = y + ICON_SIZE / 2;
                    if (type.connections[0]) { g.moveTo(cx, cy); g.lineTo(cx, y); }
                    if (type.connections[1]) { g.moveTo(cx, cy); g.lineTo(x + ICON_SIZE, cy); }
                    if (type.connections[2]) { g.moveTo(cx, cy); g.lineTo(cx, y + ICON_SIZE); }
                    if (type.connections[3]) { g.moveTo(cx, cy); g.lineTo(x, cy); }
                    leftBarContainer.addChild(g);
                }
                
                if (isLocked) {
                    const lockOverlay = new PIXI.Graphics();
                    lockOverlay.beginFill(0x888888, 0.6);
                    lockOverlay.drawRect(x, y, ICON_SIZE, ICON_SIZE);
                    lockOverlay.endFill();
                    leftBarContainer.addChild(lockOverlay);
                }

                const costLabel = new PIXI.Text(`$${type.cost}`, {
                    fontFamily: "Arial",
                    fontSize: 12,
                    fill: 0xf5c518,
                    align: "center",
                    fontWeight: "bold",
                });
                costLabel.anchor.set(0.5, 0);
                costLabel.x = x + ICON_SIZE / 2;
                costLabel.y = y + ICON_SIZE + 2;
                leftBarContainer.addChild(costLabel);
            }

            const hitArea = new PIXI.Graphics();
            hitArea.beginFill(0xffffff, 0.001);
            hitArea.drawRect(x, y, ICON_SIZE, ICON_SIZE + 10);
            hitArea.endFill();
            hitArea.interactive = true;
            hitArea.cursor = isLocked ? "not-allowed" : "pointer";
            
            hitArea.on('pointerdown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                if (!isLocked) {
                    selectedTypeId = type.id || 'DESTROY';
                    hudDirty = true;
                    draw();
                    if (onSelectCallback) onSelectCallback(type);
                }
            });
            
            leftBarContainer.addChild(hitArea);
        });

        leftBarContainer.scale.set(1 / gridScale);
        leftBarContainer.x = 10 / gridScale;
        leftBarContainer.y = (TOP_BAR_H + 8) / gridScale;
    }

    function draw() {
        const currentMoney = getMoney();
        const currentPlacementMode = getPlacementMode();
        const currentGridScale = getGridScale();
        const currentTimerInfo = getLoanTimerInfo ? getLoanTimerInfo() : { isActive: false, formattedTime: "0:00" };

        if (currentPlacementMode !== lastPlacementMode) {
            hudDirty = true;
        }

        if (currentTimerInfo.isActive !== lastTimerInfo?.isActive || 
            currentTimerInfo.formattedTime !== lastTimerInfo?.formattedTime) {
            hudDirty = true;
        }

        if (!hudDirty
            && currentMoney === lastMoney
            && currentPlacementMode === lastPlacementMode
            && currentGridScale === lastGridScale
            && currentTimerInfo.isActive === lastTimerInfo?.isActive
            && currentTimerInfo.formattedTime === lastTimerInfo?.formattedTime) return;

        lastMoney = currentMoney;
        lastPlacementMode = currentPlacementMode;
        lastGridScale = currentGridScale;
        lastTimerInfo = currentTimerInfo;
        hudDirty = false;

        drawTopBar();
        drawLeftBar();
    }

    function markDirty() {
        hudDirty = true;
        draw();
    }

    function refresh() {
        hudDirty = true;
        draw();
    }

    window.addEventListener("resize", () => {
        hudDirty = true;
        draw();
    });

    return {
        draw,
        refresh,
        markDirty,
        getSelectedType,
        setOnSelect,
        unlockRailType
    };
}