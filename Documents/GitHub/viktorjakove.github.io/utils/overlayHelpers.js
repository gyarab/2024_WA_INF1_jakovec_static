import { BUILDING_TEXTS, DEFAULT_BUILDING_TEXT } from "../text/buildingTexts.js";

export function getPath(key, idx, after, buildingState) {
    const d = BUILDING_TEXTS[key];
    if (!d) return null;
    
    const s = buildingState.get(key);
    const arr = after && d.afterTransaction?.sprite ? d.afterTransaction.sprite : d.sprite;
    if (!arr || arr[idx] === undefined) return null;
    
    const spriteValue = arr[idx];
    return `../../graphics/chars/${key}/${key}${spriteValue}.png`;
}

export function getPos(key, idx, after, app, buildingState) {
    const d = BUILDING_TEXTS[key];
    if (!d) return app.screen.width * 0.5;
    
    const s = buildingState.get(key);
    const pos = after && d.afterTransaction?.spritePos ? d.afterTransaction.spritePos[idx] : d.spritePos[idx];
    const map = { L: 0.33, C: 0.5, P: 0.66, R: 0.66 };
    return app.screen.width * (map[pos] || 0.5);
}

export function getTexts(key, buildingState) {
    const d = BUILDING_TEXTS[key];
    const s = buildingState.get(key);
    
    if (s?.completed && d?.afterTransaction?.text) {
         if (key === "olda" && window.bisonProfitStore) {
             const profit = window.bisonProfitStore.getStoredProfit();
             if (profit > 0) {
                 return d.afterTransaction.text.map(text => 
                     text.replace('${profit}', profit)
                 );
             }
         }
         
        if (d.transaction?.randomAfterText && s.afterTextIndex !== undefined) {
            return [d.afterTransaction.text[s.afterTextIndex]];
        }
        return d.afterTransaction.text;
    }
    
    return d?.text || DEFAULT_BUILDING_TEXT.text;
}

export function getStart(key, buildingState) {
    const s = buildingState.get(key);
    const d = BUILDING_TEXTS[key];
    return s?.questionShown && d?.transaction && !s?.completed ? getTexts(key, buildingState).length - 1 : 0;
}

export function updateSprite(sprite, key, idx, after, app, buildingState) {
    if (!sprite) return;
    try{
        const path = getPath(key, idx, after, buildingState);
        if (!path) return;
        
        const tex = PIXI.Texture.from(path);
        sprite.x = getPos(key, idx, after, app, buildingState);
        
        const update = () => {
            sprite.texture = tex;
            const scale = Math.min(app.screen.width, app.screen.height) * 0.6 / Math.max(tex.width, tex.height);
            sprite.scale.set(scale);
        };
        
        if (tex.valid) {
            update();
        } else {
            tex.once('update', update);
        }
    } catch (e) {
        console.error(`Error při updatování ${key} napozici ${idx}:`, e);
    }
}