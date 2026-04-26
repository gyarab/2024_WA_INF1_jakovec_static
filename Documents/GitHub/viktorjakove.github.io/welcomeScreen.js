import { getRandomCharacter, createCharacterSprite } from './utils/randomCharSelector.js';

export function createWelcomeScreen(onNewGame, spriteButtons = []) {
    let charactersApp = null;
    let charactersInitialized = false;

    const overlay = document.createElement('div');
    overlay.id = 'welcome-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.fontFamily = 'Arial, sans-serif';

    const pixiContainer = document.createElement('div');
    pixiContainer.id = 'welcome-pixi-container';
    pixiContainer.style.position = 'absolute';
    pixiContainer.style.top = '0';
    pixiContainer.style.left = '0';
    pixiContainer.style.width = '100%';
    pixiContainer.style.height = '100%';
    pixiContainer.style.pointerEvents = 'none';
    pixiContainer.style.zIndex = '9998';
    overlay.appendChild(pixiContainer);

    const topRightContainer = document.createElement('div');
    topRightContainer.style.position = 'absolute';
    topRightContainer.style.top = '20px';
    topRightContainer.style.right = '20px';
    topRightContainer.style.display = 'flex';
    topRightContainer.style.gap = '15px';
    topRightContainer.style.zIndex = '10000';
    overlay.appendChild(topRightContainer);

    spriteButtons.forEach((button) => {
        if (!button.path) return;
        
        const btnContainer = document.createElement('div');
        btnContainer.style.cursor = 'pointer';
        btnContainer.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        btnContainer.style.opacity = '0.8';
        
        btnContainer.onmouseover = () => {
            btnContainer.style.transform = 'scale(1.1)';
            btnContainer.style.opacity = '1';
        };
        btnContainer.onmouseout = () => {
            btnContainer.style.transform = 'scale(1)';
            btnContainer.style.opacity = '0.8';
        };
        
        btnContainer.onclick = (e) => {
            e.stopPropagation();
            if (button.onClick) {
                button.onClick();
            }
        };
        
        const img = document.createElement('img');
        img.src = button.path;
        img.alt = button.alt || 'button';
        img.style.width = button.width || '40px';
        img.style.height = button.height || '40px';
        img.style.pointerEvents = 'none';
        
        btnContainer.appendChild(img);
        topRightContainer.appendChild(btnContainer);
    });

    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.color = 'white';
    container.style.maxWidth = '600px';
    container.style.padding = '40px';
    container.style.background = 'rgba(0, 0, 0, 0.8)';
    container.style.borderRadius = '20px';
    container.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.7)';
    container.style.border = '2px solid #f5c518';
    container.style.backdropFilter = 'blur(5px)';
    container.style.zIndex = '10001';

    const title = document.createElement('h1');
    title.textContent = 'Wild Wild Rails 3';
    title.style.fontSize = '64px';
    title.style.color = '#f5c518';
    title.style.marginBottom = '20px';
    title.style.textShadow = '0 0 10px #f5c518, 0 0 20px #f5c518';
    title.style.animation = 'titleGlow 2s ease-in-out infinite alternate';
    container.appendChild(title);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes titleGlow {
            from { text-shadow: 0 0 10px #f5c518, 0 0 20px #f5c518; }
            to { text-shadow: 0 0 20px #f5c518, 0 0 30px #f5c518, 0 0 40px #f5c518; }
        }
    `;
    document.head.appendChild(style);

    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Divoké koleje';
    subtitle.style.fontSize = '24px';
    subtitle.style.color = '#ecf0f1';
    subtitle.style.fontStyle = 'italic';
    subtitle.style.marginBottom = '60px';
    container.appendChild(subtitle);

    const newGameBtn = document.createElement('button');
    newGameBtn.textContent = 'NOVÁ HRA';
    newGameBtn.style.width = '280px';
    newGameBtn.style.height = '70px';
    newGameBtn.style.fontSize = '32px';
    newGameBtn.style.fontWeight = 'bold';
    newGameBtn.style.border = 'none';
    newGameBtn.style.borderRadius = '12px';
    newGameBtn.style.cursor = 'pointer';
    newGameBtn.style.margin = '15px auto';
    newGameBtn.style.display = 'block';
    newGameBtn.style.backgroundColor = '#27ae60';
    newGameBtn.style.color = 'white';
    newGameBtn.style.border = '4px solid #2ecc71';
    newGameBtn.style.transition = 'all 0.2s ease';
    newGameBtn.style.textTransform = 'uppercase';
    newGameBtn.style.letterSpacing = '2px';
    newGameBtn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    
    newGameBtn.onmouseover = () => {
        newGameBtn.style.backgroundColor = '#2ecc71';
        newGameBtn.style.transform = 'scale(1.05)';
        newGameBtn.style.boxShadow = '0 8px 12px rgba(46, 204, 113, 0.4)';
    };
    newGameBtn.onmouseout = () => {
        newGameBtn.style.backgroundColor = '#27ae60';
        newGameBtn.style.transform = 'scale(1)';
        newGameBtn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    };
    newGameBtn.onclick = () => {
        if (charactersApp) {
            charactersApp.destroy(true);
            charactersApp = null;
        }
        if (overlay.parentNode) {
            document.body.removeChild(overlay);
        }
        onNewGame();
    };
    container.appendChild(newGameBtn);

    const version = document.createElement('div');
    version.textContent = 'Verze 1.0';
    version.style.position = 'absolute';
    version.style.bottom = '20px';
    version.style.left = '20px';
    version.style.color = '#95a5a6';
    version.style.fontSize = '14px';
    version.style.opacity = '0.7';
    container.appendChild(version);

    overlay.appendChild(container);
    document.body.appendChild(overlay);

    if (!charactersInitialized) {
        charactersInitialized = true;
        initCharacters(pixiContainer).then(app => {
            charactersApp = app;
        });
    }

    return {
        hide: () => {
            if (charactersApp) {
                charactersApp.destroy(true);
                charactersApp = null;
            }
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        },
        show: () => {
            if (!overlay.parentNode) {
                document.body.appendChild(overlay);
            }
        }
    };
}

async function initCharacters(container) {
    try {
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            transparent: true,
            resolution: 1,
            antialias: true
        });
        
        app.view.style.position = 'absolute';
        app.view.style.top = '0';
        app.view.style.left = '0';
        app.view.style.width = '100%';
        app.view.style.height = '100%';
        app.view.style.pointerEvents = 'none';
        
        container.appendChild(app.view);

        const leftChar = await getRandomCharacter();
        let rightChar;
        do {
            rightChar = await getRandomCharacter();
        } while (rightChar.folder === leftChar.folder);
        
        const leftSprite = await createCharacterSprite(leftChar.path, app);
        leftSprite.anchor.set(0.5);
        leftSprite.x = app.screen.width * 0.15;
        leftSprite.y = app.screen.height * 0.5;
        
        const rightSprite = await createCharacterSprite(rightChar.path, app);
        rightSprite.anchor.set(0.5);
        rightSprite.x = app.screen.width * 0.85;
        rightSprite.y = app.screen.height * 0.5;
        
        app.stage.addChild(leftSprite);
        app.stage.addChild(rightSprite);

        let time = 0;
        app.ticker.add(() => {
            time += 0.01;
            leftSprite.y = app.screen.height * 0.5 + Math.sin(time) * 10;
            rightSprite.y = app.screen.height * 0.5 + Math.cos(time) * 10;
        });

        window.addEventListener('resize', () => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            leftSprite.x = app.screen.width * 0.15;
            rightSprite.x = app.screen.width * 0.85;
        });
        
        return app;
        
    } catch (error) {
        console.error(error);
        return null;
    }
}