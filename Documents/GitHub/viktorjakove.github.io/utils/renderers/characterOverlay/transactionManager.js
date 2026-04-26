import { BUILDING_TEXTS } from "../../../text/buildingTexts.js";

export function createTransactionManager(app, panel, desc, instr, sprite, railRenderer, stationRenderer, getMoney, subMoney, addMoney, hideOverlay) {
    let trans = { active: false, key: null };
    let btnContainer = null;
    
    let currentPanel = panel;
    let currentDesc = desc;
    let currentInstr = instr;
    let currentSprite = sprite;

    const bankManager = window.bankManager;

    function updateUIElements(newPanel, newDesc, newInstr, newSprite) {
        if (newPanel) currentPanel = newPanel;
        if (newDesc) currentDesc = newDesc;
        if (newInstr) currentInstr = newInstr;
        if (newSprite) currentSprite = newSprite;
    }

    function showTransaction(key, buildingState) {
        try{
            const d = BUILDING_TEXTS[key];
            if (!d?.transaction) return false;
            
            if (d.transaction.type === "bank") {
                return showBankTransaction(key, d, buildingState);
            }
            if (d.transaction.type === "unlock_bison") {
                return showBisonUnlockTransaction(key, d, buildingState);
            }
            if (d.transaction.type === "unlock_speed") {
                return showSpeedUnlockTransaction(key, d, buildingState);
            }
            if (d.transaction.type === "unlock_tracks") {
                return showTracksUnlockTransaction(key, d, buildingState);
            }
        
            if (d.transaction.questionSprite !== undefined) {
                const path = `../../graphics/chars/${key}/${key}${d.transaction.questionSprite}.png`;
                const tex = PIXI.Texture.from(path);
                
                const update = () => {
                    if (currentSprite) {
                        currentSprite.texture = tex;
                        const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(tex.width, tex.height);
                        currentSprite.scale.set(scale);
                    }
                };
                
                if (tex.valid) {
                    update();
                } else {
                    tex.once('update', update);
                }
                
                if (d.transaction.questionSpritePos && currentSprite) {
                    const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
                    currentSprite.x = app.screen.width * (map[d.transaction.questionSpritePos] || 0.5);
                }
            }
        
            if (key === "bussiness" && d.transaction.cost === 300) {
                if (window.trainRenderer) {
                    window.trainRenderer.setTrainSpeedMultiplier(3);
                }
            } else if (key === "mech" && d.transaction.cost === 500) {
                if (window.hudRenderer) {
                    window.hudRenderer.unlockRailType("T_N");
                    window.hudRenderer.unlockRailType("T_E");
                    window.hudRenderer.unlockRailType("T_S");
                    window.hudRenderer.unlockRailType("T_W");
                }
            }
            
            if (currentInstr) currentInstr.visible = false;
            currentDesc.text = `${d.transaction.question}\n\nCena: $${d.transaction.cost}`;
        
            if (btnContainer) btnContainer.destroy();
            btnContainer = new PIXI.Container();
        
            const yes = createButton("ANO", 0x27ae60, 0x2ecc71, () => {
                if (getMoney() >= d.transaction.cost) {
                    subMoney(d.transaction.cost);
                    
                    buildingState.set(key, { completed: true, questionShown: true });
                    
                    if (d.transaction.randomAfterText && d.afterTransaction?.text) {
                        const randomIndex = Math.floor(Math.random() * d.afterTransaction.text.length);
                        buildingState.get(key).afterTextIndex = randomIndex;
                    }
                    
                    trans.active = false;
                    
                    if (d.transaction.randomAfterText && d.afterTransaction?.text) {
                        const afterTexts = d.afterTransaction.text;
                        const randomIndex = buildingState.get(key).afterTextIndex || 0;
                        currentDesc.text = afterTexts[randomIndex];
                    } else if (d.transaction.successText) {
                        currentDesc.text = d.transaction.successText;
                    } else {
                        currentDesc.text = "Transakce proběhla úspěšně!";
                    }
                    
                    if (currentInstr) {
                        currentInstr.visible = true;
                        currentInstr.text = "Klikni kamkoli pro zavření...";
                    }
                    
                    if (d.transaction.successSprite !== undefined) {
                        updateSuccessSprite(key, d, buildingState.get(key)?.afterTextIndex);
                    }
                    
                    destroyButtons();
                    showInstruction(true);
                } else {
                    currentDesc.text = d.transaction.failText || "Nemáš dost peněz.";
                    
                    if (currentInstr) {
                        currentInstr.visible = true;
                        currentInstr.text = "Klikni kamkoli pro zavření...";
                    }
                    
                    if (d.transaction.failSprite !== undefined) {
                        updateFailSprite(key, d);
                    }
                    
                    destroyButtons();
                    trans.active = false;
                    showInstruction(true);
                }
            });
        
            const no = createButton("NE", 0xc0392b, 0xe74c3c, hideOverlay);
        
            const total = 120 * 2 + 30;
            yes.x = (currentPanel.width - total) / 2;
            no.x = yes.x + 150;
            yes.y = no.y = (currentPanel.height - 50) / 2 + 40;
        
            btnContainer.addChild(yes, no);
            currentPanel.addChild(btnContainer);
            
            return true;
        } catch (error) {
            console.error("Error v showTransaction:", error);
            return false;
        }
    }

    function showBisonUnlockTransaction(key, d, buildingState) {
        if (currentInstr) currentInstr.visible = false;
        
        const path = `../../graphics/chars/${key}/${key}${d.transaction.questionSprite}.png`;
        const tex = PIXI.Texture.from(path);
        
        const update = () => {
            if (currentSprite) {
                currentSprite.texture = tex;
                const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(tex.width, tex.height);
                currentSprite.scale.set(scale);
            }
        };
        
        if (tex.valid) update();
        else tex.once('update', update);
        
        if (d.transaction.questionSpritePos && currentSprite) {
            const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
            currentSprite.x = app.screen.width * (map[d.transaction.questionSpritePos] || 0.5);
        }

        if (window.bisonProfitStore) {
            const profit = window.bisonProfitStore.getStoredProfit();
            if (profit > 0) {
                currentDesc.text = `Máš nastřádáno $${profit} z bizonů! Chceš si to vyzvednout?`;
                
                if (btnContainer) btnContainer.destroy();
                btnContainer = new PIXI.Container();
                
                const yes = createButton("ANO", 0x27ae60, 0x2ecc71, () => {
                    const withdrawn = window.bisonProfitStore.withdrawProfit(addMoney);
                    currentDesc.text = `Vyzvedl jsi $${withdrawn}!`;
                    
                    if (currentInstr) {
                        currentInstr.visible = true;
                        currentInstr.text = "Klikni kamkoli pro zavření...";
                    }
                    
                    destroyButtons();
                    trans.active = false;
                    showInstruction(true);
                });
                
                const no = createButton("NE", 0xc0392b, 0xe74c3c, hideOverlay);
                
                const total = 120 * 2 + 30;
                yes.x = (currentPanel.width - total) / 2;
                no.x = yes.x + 150;
                yes.y = no.y = (currentPanel.height - 50) / 2 + 40;
                
                btnContainer.addChild(yes, no);
                currentPanel.addChild(btnContainer);
                
                return true;
            }
        }

        if (!window.bisonManager?.isBisonUnlocked()) {
            currentDesc.text = `${d.transaction.question}\n\nCena: $${d.transaction.cost}`;
            
            if (btnContainer) btnContainer.destroy();
            btnContainer = new PIXI.Container();
            
            const yes = createButton("ANO", 0x27ae60, 0x2ecc71, () => {
                if (getMoney() >= d.transaction.cost) {
                    subMoney(d.transaction.cost);
                    
                    if (window.bisonManager) {
                        window.bisonManager.unlockBisonBuilding();
                    }
                    
                    buildingState.set(key, { completed: true, questionShown: true });
                    
                    trans.active = false;
                    currentDesc.text = d.transaction.successText;
                    
                    if (currentInstr) {
                        currentInstr.visible = true;
                        currentInstr.text = "Klikni kamkoli pro zavření...";
                    }
                    
                    if (d.transaction.successSprite !== undefined) {
                        updateSuccessSprite(key, d);
                    }
                    
                    destroyButtons();
                    showInstruction(true);
                } else {
                    currentDesc.text = d.transaction.failText;
                    
                    if (currentInstr) {
                        currentInstr.visible = true;
                        currentInstr.text = "Klikni kamkoli pro zavření...";
                    }
                    
                    if (d.transaction.failSprite !== undefined) {
                        updateFailSprite(key, d);
                    }
                    
                    destroyButtons();
                    trans.active = false;
                    showInstruction(true);
                }
            });
            
            const no = createButton("NE", 0xc0392b, 0xe74c3c, hideOverlay);
            
            const total = 120 * 2 + 30;
            yes.x = (currentPanel.width - total) / 2;
            no.x = yes.x + 150;
            yes.y = no.y = (currentPanel.height - 50) / 2 + 40;
            
            btnContainer.addChild(yes, no);
            currentPanel.addChild(btnContainer);
        } else {
            hideOverlay();
        }
        
        return true;
    }

    function showBankTransaction(key, d, buildingState) {
        if (currentInstr) currentInstr.visible = false;
        
        const path = `../../graphics/chars/${key}/${key}${d.transaction.questionSprite}.png`;
        const tex = PIXI.Texture.from(path);
        
        const update = () => {
            if (currentSprite) {
                currentSprite.texture = tex;
                const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(tex.width, tex.height);
                currentSprite.scale.set(scale);
            }
        };
        
        if (tex.valid) {
            update();
        } else {
            tex.once('update', update);
        }
        
        if (d.transaction.questionSpritePos && currentSprite) {
            const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
            currentSprite.x = app.screen.width * (map[d.transaction.questionSpritePos] || 0.5);
        }
        
        if (bankManager && bankManager.isLoanActive()) {
            currentDesc.text = "Chceš splatit svůj dluh?";
            bankManager.showLoanUI(currentPanel, currentDesc, currentInstr, currentSprite, (shouldClose) => {
                if (shouldClose) {
                    hideOverlay();
                }
            });
        } else {
            currentDesc.text = ``;
            bankManager.showLoanUI(currentPanel, currentDesc, currentInstr, currentSprite, (shouldClose) => {
                if (shouldClose) {
                    hideOverlay();
                }
            });
        }
        
        return true;
    }

    function showSpeedUnlockTransaction(key, d, buildingState) {
        if (currentInstr) currentInstr.visible = false;
        
        const path = `../../graphics/chars/${key}/${key}${d.transaction.questionSprite}.png`;
        const tex = PIXI.Texture.from(path);
        const update = () => {
            if (currentSprite) {
                currentSprite.texture = tex;
                const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(tex.width, tex.height);
                currentSprite.scale.set(scale);
            }
        };
        if (tex.valid) update(); else tex.once('update', update);
        
        if (d.transaction.questionSpritePos && currentSprite) {
            const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
            currentSprite.x = app.screen.width * (map[d.transaction.questionSpritePos] || 0.5);
        }

        currentDesc.text = `${d.transaction.question}\n\nCena: $${d.transaction.cost}`;
        
        if (btnContainer) btnContainer.destroy();
        btnContainer = new PIXI.Container();
        
        const yes = createButton("ANO", 0x27ae60, 0x2ecc71, () => {
            if (getMoney() >= d.transaction.cost) {
                subMoney(d.transaction.cost);
                
                if (window.trainRenderer) {
                    window.trainRenderer.setTrainSpeedMultiplier(3);
                }
                
                buildingState.set(key, { completed: true, questionShown: true });
                
                trans.active = false;
                if (d.transaction.successText) {
                    currentDesc.text = d.transaction.successText;
                } else {
                    currentDesc.text = "Nákup proběhl úspěšně!";
                }
                
                if (currentInstr) {
                    currentInstr.visible = true;
                    currentInstr.text = "Klikni kamkoli pro zavření...";
                }
                
                if (d.transaction.successSprite !== undefined) {
                    updateSuccessSprite(key, d);
                }
                
                destroyButtons();
                showInstruction(true);
            } else {
                currentDesc.text = d.transaction.failText || "Nemáš dost peněz.";
                
                if (currentInstr) {
                    currentInstr.visible = true;
                    currentInstr.text = "Klikni kamkoli pro zavření...";
                }
                
                if (d.transaction.failSprite !== undefined) {
                    updateFailSprite(key, d);
                }
                
                destroyButtons();
                trans.active = false;
                showInstruction(true);
            }
        });
        
        const no = createButton("NE", 0xc0392b, 0xe74c3c, hideOverlay);
        
        const total = 120 * 2 + 30;
        yes.x = (currentPanel.width - total) / 2;
        no.x = yes.x + 150;
        yes.y = no.y = (currentPanel.height - 50) / 2 + 40;
        
        btnContainer.addChild(yes, no);
        currentPanel.addChild(btnContainer);
        
        return true;
    }

    function showTracksUnlockTransaction(key, d, buildingState) {
        if (currentInstr) currentInstr.visible = false;
        
        const path = `../../graphics/chars/${key}/${key}${d.transaction.questionSprite}.png`;
        const tex = PIXI.Texture.from(path);
        const update = () => {
            if (currentSprite) {
                currentSprite.texture = tex;
                const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(tex.width, tex.height);
                currentSprite.scale.set(scale);
            }
        };
        if (tex.valid) update(); else tex.once('update', update);
        
        if (d.transaction.questionSpritePos && currentSprite) {
            const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
            currentSprite.x = app.screen.width * (map[d.transaction.questionSpritePos] || 0.5);
        }

        currentDesc.text = `${d.transaction.question}\n\nCena: $${d.transaction.cost}`;
        
        if (btnContainer) btnContainer.destroy();
        btnContainer = new PIXI.Container();
        
        const yes = createButton("ANO", 0x27ae60, 0x2ecc71, () => {
            if (getMoney() >= d.transaction.cost) {
                subMoney(d.transaction.cost);
                
                if (window.hudRenderer) {
                    window.hudRenderer.unlockRailType("T_N");
                    window.hudRenderer.unlockRailType("T_E");
                    window.hudRenderer.unlockRailType("T_S");
                    window.hudRenderer.unlockRailType("T_W");
                }
                
                buildingState.set(key, { completed: true, questionShown: true });
                
                trans.active = false;
                if (d.transaction.successText) {
                    currentDesc.text = d.transaction.successText;
                } else {
                    currentDesc.text = "Nákup proběhl úspěšně!";
                }
                
                if (currentInstr) {
                    currentInstr.visible = true;
                    currentInstr.text = "Klikni kamkoli pro zavření...";
                }
                
                if (d.transaction.successSprite !== undefined) {
                    updateSuccessSprite(key, d);
                }
                
                destroyButtons();
                showInstruction(true);
            } else {
                currentDesc.text = d.transaction.failText || "Nemáš dost peněz.";
                
                if (currentInstr) {
                    currentInstr.visible = true;
                    currentInstr.text = "Klikni kamkoli pro zavření...";
                }
                
                if (d.transaction.failSprite !== undefined) {
                    updateFailSprite(key, d);
                }
                
                destroyButtons();
                trans.active = false;
                showInstruction(true);
            }
        });
        
        const no = createButton("NE", 0xc0392b, 0xe74c3c, hideOverlay);
        
        const total = 120 * 2 + 30;
        yes.x = (currentPanel.width - total) / 2;
        no.x = yes.x + 150;
        yes.y = no.y = (currentPanel.height - 50) / 2 + 40;
        
        btnContainer.addChild(yes, no);
        currentPanel.addChild(btnContainer);
        
        return true;
    }

    function updateSuccessSprite(key, d, afterTextIndex = null) {
        if (!currentSprite) return;
        
        let spriteValue;
        if (afterTextIndex !== null && d.afterTransaction?.sprite && d.afterTransaction.sprite[afterTextIndex] !== undefined) {
            spriteValue = d.afterTransaction.sprite[afterTextIndex];
        } else {
            spriteValue = d.transaction.successSprite;
        }
        
        const path = `../../graphics/chars/${key}/${key}${spriteValue}.png`;
        const tex = PIXI.Texture.from(path);
        
        const update = () => {
            if (currentSprite) {
                currentSprite.texture = tex;
                const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(tex.width, tex.height);
                currentSprite.scale.set(scale);
            }
        };
        
        if (tex.valid) {
            update();
        } else {
            tex.once('update', update);
        }
        
        if (afterTextIndex !== null && d.afterTransaction?.spritePos && d.afterTransaction.spritePos[afterTextIndex]) {
            const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
            currentSprite.x = app.screen.width * (map[d.afterTransaction.spritePos[afterTextIndex]] || 0.5);
        } else if (d.transaction.successSpritePos && currentSprite) {
            const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
            currentSprite.x = app.screen.width * (map[d.transaction.successSpritePos] || 0.5);
        }
    }

    function updateFailSprite(key, d) {
        if (!currentSprite) return;
        
        const path = `../../graphics/chars/${key}/${key}${d.transaction.failSprite}.png`;
        const tex = PIXI.Texture.from(path);
        
        const update = () => {
            if (currentSprite) {
                currentSprite.texture = tex;
                const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(tex.width, tex.height);
                currentSprite.scale.set(scale);
            }
        };
        
        if (tex.valid) {
            update();
        } else {
            tex.once('update', update);
        }
        
        if (d.transaction.failSpritePos && currentSprite) {
            const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
            currentSprite.x = app.screen.width * (map[d.transaction.failSpritePos] || 0.5);
        }
    }

    function createButton(text, color, hover, onClick) {
        const btn = new PIXI.Graphics()
            .beginFill(color)
            .lineStyle(2, hover)
            .drawRoundedRect(0, 0, 120, 50, 8)
            .endFill();
        
        btn.interactive = true;
        btn.cursor = "pointer";
        
        const txt = new PIXI.Text(text, { 
            fontFamily: "Arial", 
            fontSize: 20, 
            fill: 0xffffff, 
            fontWeight: "bold" 
        });
        txt.anchor.set(0.5);
        txt.x = 60;
        txt.y = 25;
        btn.addChild(txt);
        
        btn.on('pointerdown', (e) => { 
            e.stopPropagation(); 
            e.preventDefault(); 
            onClick(); 
        });
        
        return btn;
    }

    function destroyButtons() {
        if (btnContainer) {
            btnContainer.destroy();
            btnContainer = null;
        }
    }

    function showInstruction(visible) {
        if (currentInstr) {
            currentInstr.visible = visible;
            if (visible) currentInstr.text = "Klikni kamkoli pro zavření...";
        }
    }

    function setActive(active, key) {
        trans.active = active;
        trans.key = key;
    }

    function isActive() {
        return trans.active;
    }

    function getKey() {
        return trans.key;
    }

    return {
        showTransaction,
        setActive,
        isActive,
        getKey,
        destroyButtons,
        updateUIElements
    };
}