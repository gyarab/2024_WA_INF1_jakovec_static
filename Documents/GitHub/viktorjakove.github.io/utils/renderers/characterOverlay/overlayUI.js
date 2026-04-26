export function createOverlayUI(app, container, handleClick) {
    let bg = null;
    let sprite = null;
    let panel = null;
    let desc = null;
    let instr = null;
    let textIdx = 0;

    function createBackground() {
        bg = new PIXI.Graphics()
            .beginFill(0x000000, 0.7)
            .drawRect(0, 0, app.screen.width, app.screen.height)
            .endFill();
        bg.alpha = 0;
        bg.interactive = true;
        bg.on('pointerdown', (e) => { e.stopPropagation(); handleClick(); });
        container.addChild(bg);
        return bg;
    }

    function createSprite(path, posX, posY, skipSprite = false) {
        if (skipSprite) {
            sprite = null;
            return null;
        }
        
        const tex = path ? PIXI.Texture.from(path) : PIXI.Texture.WHITE;
        sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5);
        sprite.x = posX;
        sprite.y = posY || app.screen.height / 5 * 2;
        
        if (path) {
            const setScale = () => {
                if (sprite.texture && sprite.texture.valid) {
                    const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(sprite.texture.width, sprite.texture.height);
                    sprite.scale.set(scale);
                }
            };
            
            if (tex.valid) {
                setScale();
            } else {
                tex.once('update', setScale);
            }
        } else {
            sprite.visible = false;
        }
        
        sprite.interactive = true;
        sprite.on('pointerdown', (e) => { e.stopPropagation(); handleClick(); });
        container.addChild(sprite);
        return sprite;
    }

    function createPanel(title, description, instruction) {
        panel = new PIXI.Container();
        const w = app.screen.width * 0.8;
        const h = app.screen.height * 0.4;
        
        const panelBg = new PIXI.Graphics()
            .beginFill(0x2c3e50, 0.95)
            .lineStyle(2, 0xf5c518)
            .drawRoundedRect(0, 0, w, h, 12)
            .endFill();
        panelBg.interactive = true;
        panelBg.on('pointerdown', (e) => { e.stopPropagation(); handleClick(); });
        panel.addChild(panelBg);

        const titleText = new PIXI.Text(title, { 
            fontFamily: "Arial", 
            fontSize: 28, 
            fill: 0xf5c518, 
            fontWeight: "bold" 
        });
        titleText.x = 20;
        titleText.y = 20;
        panel.addChild(titleText);

        desc = new PIXI.Text(description, { 
            fontFamily: "Arial", 
            fontSize: 22, 
            fill: 0xecf0f1, 
            fontStyle: "italic", 
            wordWrap: true, 
            wordWrapWidth: w - 40, 
            align: "left" 
        });
        desc.x = 20;
        desc.y = 70;
        desc.interactive = true;
        desc.on('pointerdown', (e) => { e.stopPropagation(); handleClick(); });
        panel.addChild(desc);

        instr = new PIXI.Text(instruction, { 
            fontFamily: "Arial", 
            fontSize: 14, 
            fill: 0x95a5a6, 
            fontStyle: "italic" 
        });
        instr.x = w - 220;
        instr.y = h - 30;
        instr.interactive = true;
        instr.on('pointerdown', (e) => { e.stopPropagation(); handleClick(); });
        panel.addChild(instr);

        panel.x = (app.screen.width - w) / 2;
        panel.y = app.screen.height - h - 20;
        panel.interactive = true;
        panel.interactiveChildren = true;
        container.addChild(panel);
        
        return { panel, desc, instr };
    }

    function fadeIn() {
        if (!bg) return;
        const start = Date.now();
        const anim = () => {
            const prog = Math.min((Date.now() - start) / 600, 1);
            bg.alpha = (1 - Math.pow(1 - prog, 3)) * 0.8;
            if (prog < 1) requestAnimationFrame(anim);
        };
        anim();
    }

    function setText(newText) {
        if (desc) desc.text = newText;
    }

    function setInstruction(newText) {
        if (instr) instr.text = newText;
    }

    function setInstructionVisible(visible) {
        if (instr) instr.visible = visible;
    }

    function incrementTextIndex() {
        textIdx++;
        return textIdx;
    }

    function setTextIndex(index) {
        textIdx = index;
    }

    function getTextIndex() {
        return textIdx;
    }

    function destroy() {
        if (bg) bg.destroy();
        if (sprite) sprite.destroy();
        if (panel) panel.destroy();
        bg = sprite = panel = desc = instr = null;
        textIdx = 0;
    }

    return {
        createBackground,
        createSprite,
        createPanel,
        fadeIn,
        setText,
        setInstruction,
        setInstructionVisible,
        incrementTextIndex,
        setTextIndex,
        getTextIndex,
        destroy,
        get sprite() { return sprite; },
        get desc() { return desc; },
        get instr() { return instr; },
        get panel() { return panel; }
    };
}