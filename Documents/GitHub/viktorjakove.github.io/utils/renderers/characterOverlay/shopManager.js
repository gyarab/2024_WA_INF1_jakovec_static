import { SHOP_ITEMS, BARBER_ITEMS, MARCO_ITEMS } from "../../../enums/shopItems.js";

export function createShopManager(app, getMoney, subMoney, railRenderer, stationRenderer) {
    const SHOP_ITEMS_MAP = {
        "shop": SHOP_ITEMS,
        "barber": BARBER_ITEMS,
        "marco": MARCO_ITEMS
    };
    
    const purchasedItems = new Map();
    let shopContainer = null;
    let currentBuildingType = null;
    let currentPanel = null;
    let currentDesc = null;
    let currentInstr = null;
    
    let currentPage = 0;
    const ITEMS_PER_PAGE = 3;

    function showShop(buildingType, panel, desc, instr) {
        try{
        if (!buildingType) return;
        
            const items = SHOP_ITEMS_MAP[buildingType];
            if (!items || items.length === 0) return;
        
            currentBuildingType = buildingType;
            currentPanel = panel;
            currentDesc = desc;
            currentInstr = instr;
        
            if (shopContainer) {
                shopContainer.destroy();
                shopContainer = null;
            }
        
            if (instr) instr.visible = false;
        
            desc.text = "Vyber si zboží...";
        
            shopContainer = new PIXI.Container();
        
            const panelW = panel.width;
            const panelH = panel.height;
        
            const squareSize = Math.min(160, panelW * 0.22);
            const spacing = 20;
            const totalWidth = 3 * squareSize + 2 * spacing;
            const startX = (panelW - totalWidth) / 2;
            const startY = 90;
        
            const currentPurchased = purchasedItems.get(buildingType);
        
            const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
            const startIndex = currentPage * ITEMS_PER_PAGE;
            const displayItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        
            displayItems.forEach((item, index) => {
                const x = startX + index * (squareSize + spacing);
                const y = startY;
            
                const isPurchased = currentPurchased === item.name;
            
                const squareContainer = createItemSquare(item, x, y, squareSize, isPurchased, buildingType, panel, desc, instr);
                shopContainer.addChild(squareContainer);
            });
        
            if (totalPages > 1) {
                addNavigationButtons(panelW, startY + squareSize + 30, totalPages);
            }
        
            if (totalPages > 1) {
                const pageIndicator = createPageIndicator(panelW, startY + squareSize + 70, currentPage + 1, totalPages);
                shopContainer.addChild(pageIndicator);
            }
        
            const closeBtn = createCloseButton(panelW, panelH, hide);
            shopContainer.addChild(closeBtn);
        
            panel.addChild(shopContainer);
        } catch (error) {
            console.error("Chyba při zobrazování shopu:", error);
        }
    }
    
    function createItemSquare(item, x, y, size, isPurchased, buildingType, panel, desc, instr) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        
        const squareBg = new PIXI.Graphics();
        if (isPurchased) {
            squareBg.beginFill(0x2c3e50, 0.8);
            squareBg.lineStyle(4, 0x27ae60);
        } else {
            squareBg.beginFill(0x34495e, 0.9);
            squareBg.lineStyle(4, 0xf5c518);
        }
        squareBg.drawRoundedRect(0, 0, size, size, 16);
        squareBg.endFill();
        container.addChild(squareBg);
        
        const iconBg = new PIXI.Graphics();
        iconBg.beginFill(0x2c3e50, 0.6);
        iconBg.drawRoundedRect(10, 10, size - 20, size - 70, 10);
        iconBg.endFill();
        container.addChild(iconBg);
        
        const itemIcon = new PIXI.Text("📦", {
            fontFamily: "Arial",
            fontSize: 36,
            fill: 0xf5c518
        });
        itemIcon.anchor.set(0.5);
        itemIcon.x = size / 2;
        itemIcon.y = size / 2 - 15;
        container.addChild(itemIcon);
        
        const nameText = new PIXI.Text(item.name, {
            fontFamily: "Arial",
            fontSize: 14,
            fill: 0xecf0f1,
            fontWeight: "bold",
            align: "center",
            wordWrap: true,
            wordWrapWidth: size - 15
        });
        nameText.anchor.set(0.5, 0);
        nameText.x = size / 2;
        nameText.y = size - 55;
        container.addChild(nameText);
        
        const priceBg = new PIXI.Graphics();
        priceBg.beginFill(0xf5c518, 0.9);
        priceBg.drawRoundedRect(size/2 - 35, size - 40, 70, 24, 6);
        priceBg.endFill();
        container.addChild(priceBg);
        
        const priceText = new PIXI.Text(`$${item.cost}`, {
            fontFamily: "Arial",
            fontSize: 14,
            fill: 0x000000,
            fontWeight: "bold"
        });
        priceText.anchor.set(0.5);
        priceText.x = size / 2;
        priceText.y = size - 28;
        container.addChild(priceText);
        
        if (isPurchased) {
            const activeText = new PIXI.Text("AKTIVNÍ", {
                fontFamily: "Arial",
                fontSize: 10,
                fill: 0x27ae60,
                fontWeight: "bold"
            });
            activeText.anchor.set(0.5);
            activeText.x = size / 2;
            activeText.y = size - 12;
            container.addChild(activeText);
        } else {
            const buyText = new PIXI.Text(item.buyText || "Koupit", {
                fontFamily: "Arial",
                fontSize: 10,
                fill: 0x95a5a6
            });
            buyText.anchor.set(0.5);
            buyText.x = size / 2;
            buyText.y = size - 12;
            container.addChild(buyText);
        }
        
        if (!isPurchased) {
            container.interactive = true;
            container.cursor = "pointer";
            
            container.on('pointerdown', (e) => {
                e.stopPropagation();
                handleItemPurchase(e, buildingType, item, panel, desc, instr);
            });
        }
        
        return container;
    }
    
    function addNavigationButtons(panelW, yPos, totalPages) {
        const btnSize = 40;
        const spacing = 70;
        const centerX = panelW / 2;
        
        if (currentPage > 0) {
            const leftBtn = createNavButton("◀", centerX - spacing, yPos, btnSize, () => {
                currentPage--;
                refreshShop();
            });
            shopContainer.addChild(leftBtn);
        }
        
        if (currentPage < totalPages - 1) {
            const rightBtn = createNavButton("▶", centerX + spacing, yPos, btnSize, () => {
                currentPage++;
                refreshShop();
            });
            shopContainer.addChild(rightBtn);
        }
    }
    
    function createNavButton(text, x, y, size, onClick) {
        const btn = new PIXI.Container();
        btn.x = x;
        btn.y = y;
        
        const bg = new PIXI.Graphics();
        bg.beginFill(0x34495e, 0.9);
        bg.lineStyle(2, 0xf5c518);
        bg.drawCircle(0, 0, size/2);
        bg.endFill();
        btn.addChild(bg);
        
        const label = new PIXI.Text(text, {
            fontFamily: "Arial",
            fontSize: 24,
            fill: 0xf5c518,
            fontWeight: "bold"
        });
        label.anchor.set(0.5);
        label.x = 0;
        label.y = 0;
        btn.addChild(label);
        
        btn.interactive = true;
        btn.cursor = "pointer";
        
        btn.on('pointerdown', (e) => {
            e.stopPropagation();
            onClick();
        });
        
        return btn;
    }
    
    function createPageIndicator(panelW, yPos, currentPage, totalPages) {
        const container = new PIXI.Container();
        container.x = panelW / 2;
        container.y = yPos;
        
        const text = new PIXI.Text(`${currentPage} / ${totalPages}`, {
            fontFamily: "Arial",
            fontSize: 14,
            fill: 0xf5c518,
            fontWeight: "bold"
        });
        text.anchor.set(0.5);
        container.addChild(text);
        
        return container;
    }

    function createCloseButton(panelW, panelH, hideCallback) {
        const btn = new PIXI.Container();
        
        const bg = new PIXI.Graphics();
        bg.beginFill(0xc0392b, 0.9);
        bg.lineStyle(2, 0xe74c3c);
        bg.drawRoundedRect(0, 0, 90, 32, 6);
        bg.endFill();
        btn.addChild(bg);
        
        const text = new PIXI.Text("Zavřít", {
            fontFamily: "Arial",
            fontSize: 14,
            fill: 0xffffff,
            fontWeight: "bold"
        });
        text.anchor.set(0.5);
        text.x = 45;
        text.y = 16;
        btn.addChild(text);
        
        btn.x = panelW - 110;
        btn.y = panelH - 45;
        btn.interactive = true;
        btn.cursor = "pointer";
        
        btn.on('pointerdown', (e) => {
            e.stopPropagation();
            hideCallback();
        });
        
        return btn;
    }
    
    function refreshShop() {
        if (currentBuildingType && currentPanel && currentDesc && currentInstr) {
            showShop(currentBuildingType, currentPanel, currentDesc, currentInstr);
        }
    }

    function handleItemPurchase(e, buildingType, item, panel, desc, instr) {
        e.stopPropagation();
        
        if (getMoney() >= item.cost) {
            subMoney(item.cost);
            purchasedItems.set(buildingType, item.name);
            desc.text = `Zakoupeno: ${item.name}!`;
            
            showShop(buildingType, panel, desc, instr);
            
            if (railRenderer) railRenderer.markDirty();
            if (stationRenderer) stationRenderer.markDirty();
        } else {
            desc.text = "Nemáš dost peněz!";
        }
    }

    function hide() {
        if (shopContainer) {
            shopContainer.destroy();
            shopContainer = null;
        }
        if (currentPanel && currentPanel.parent && currentPanel.parent.hideOverlay) {
            currentPanel.parent.hideOverlay();
        }
    }

    function hasItems(buildingType) {
        const items = SHOP_ITEMS_MAP[buildingType];
        return items && items.length > 0;
    }

    function getPurchasedItem(buildingType) {
        return purchasedItems.get(buildingType);
    }

    return {
        showShop,
        hide,
        hasItems,
        getPurchasedItem,
        get shopContainer() { return shopContainer; }
    };
}