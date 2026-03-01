/**
 * Console experience module
 * Provides developer tools and easter eggs
 */

import { useGamificationStore } from '@/lib/store/gamification';

// Encoded config (internal)
const _c = [116,117,116,111,100,101,99,111,100,101];
const _l = [65,71,80,76,45,51];
const _e = () => String.fromCharCode(..._c) + '.' + String.fromCharCode(111,114,103);

const ASCII_LOGO = `
%c
   ████████╗██████╗  ██████╗
      ██╔══╝██╔══██╗██╔════╝
      ██║   ██║  ██║██║     
      ██║   ██║  ██║██║     
      ██║   ██████╔╝╚██████╗
      ╚═╝   ╚═════╝  ╚═════╝
%c
   🖥️  Learning Platform v3.0
   📜 Open Source - AGPL-3.0
   
   SYSTEM: ONLINE | MODE: TRAINING
`;

const LOG_STYLE_TITLE = 'color: #3b82f6; font-weight: bold; font-family: monospace; font-size: 10px;';
const LOG_STYLE_INFO = 'color: #10b981; font-family: monospace; font-size: 12px;';
const LOG_STYLE_WARN = 'color: #f59e0b; font-family: monospace; font-size: 12px;';

export function initializeConsole() {
    if ((import.meta as any).env.PROD) {
        console.clear();
    }

    setTimeout(() => {
        console.log(ASCII_LOGO, LOG_STYLE_TITLE, LOG_STYLE_INFO);

        console.log(
            '%c[SYSTEM] Learning modules loaded.',
            'color: #0ea5e9; font-family: monospace;'
        );
        console.log(
            '%c[SECURE] Local-first architecture active.',
            LOG_STYLE_INFO
        );

        // Stealth signature (invisible)
        const _s = btoa(`${_e()}:${String.fromCharCode(..._l)}`);
        console.log('%c' + _s, 'color: transparent; font-size: 1px;');

        // @ts-ignore
        window.hack = () => {
            console.clear();
            const styles = [
                'background: #000',
                'color: #0f0',
                'line-height: 20px',
                'padding: 10px',
                'font-family: monospace'
            ].join(';');

            console.log('%c ACCESS GRANTED. ROOT SHELL ACTIVE.', styles);

            // 1. Gamification
            const store = useGamificationStore.getState();
            if (!store.unlockedFeatures.includes('hacker-mode')) {
                store.unlockFeature('hacker-mode');
                store.addXp(1337);
                console.log('%c[REWARD] 1337 XP Added. "Hacker Mode" Unlocked.', 'color: #facc15;');
            }

            // 2. Matrix Rain Effect
            if (!document.getElementById('matrix-canvas')) {
                const canvas = document.createElement('canvas');
                canvas.id = 'matrix-canvas';
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100vw';
                canvas.style.height = '100vh';
                canvas.style.zIndex = '99999';
                canvas.style.pointerEvents = 'none'; // Pas d'interaction
                canvas.style.opacity = '0.8';
                document.body.appendChild(canvas);

                const ctx = canvas.getContext('2d')!;
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                const chars = '0123456789ABCDEF';
                const fontSize = 16;
                const columns = canvas.width / fontSize;
                const drops: number[] = [];

                for (let x = 0; x < columns; x++) {
                    drops[x] = 1;
                }

                const draw = () => {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.fillStyle = '#0F0';
                    ctx.font = fontSize + 'px monospace';

                    for (let i = 0; i < drops.length; i++) {
                        const text = chars.charAt(Math.floor(Math.random() * chars.length));
                        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                            drops[i] = 0;
                        }
                        drops[i]++;
                    }
                };

                const interval = setInterval(draw, 33);

                // Stop after 5 seconds
                setTimeout(() => {
                    clearInterval(interval);
                    canvas.remove();
                    console.log('%c[SYSTEM] Trace complete. Access level: GOD MODE.', 'color: #0f0; font-family: monospace;');
                }, 5000);
            }

            // 3. Fake "Buffer Overflow" logs
            let i = 0;
            const fakeLogs = setInterval(() => {
                console.log(`%c[BUFFER_OVERFLOW] 0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase()} SEGMENTATION FAULT`, 'color: red; font-size: 10px;');
                i++;
                if (i > 50) clearInterval(fakeLogs);
            }, 50);

            return "INJECTING PAYLOAD...";
        };

        console.log(
            '%cWarning: Do NOT run "window.hack()" unless you want to crash the mainframe (or just see cool colors).',
            'color: #ef4444; font-family: monospace; font-weight: bold;'
        );
    }, 1000);
}
