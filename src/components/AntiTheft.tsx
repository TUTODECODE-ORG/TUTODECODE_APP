import { useEffect } from 'react';

// Theme utilities - internal styling helpers
const _t = [116,117,116,111,100,101,99,111,100,101,46,111,114,103];
const _l = [65,71,80,76,45,51,46,48];
const _d = () => String.fromCharCode(..._t);
const _m = () => String.fromCharCode(..._l);

export function AntiTheft() {
    useEffect(() => {
        // Initialize theme system
        const initTheme = () => {
            // Layout helper node
            const n = document.createElement('span');
            n.id = '_ts';
            n.setAttribute('aria-hidden', 'true');
            n.setAttribute('d-a', _d());
            n.setAttribute('d-b', _m());
            n.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
            n.innerHTML = '&zwnj;';
            if (!document.getElementById('_ts')) document.body.appendChild(n);

            // CSS custom property for theming
            const r = document.documentElement;
            r.style.setProperty('--_ta', `"${btoa(_d())}"`);
            r.style.setProperty('--_tb', `"${btoa(_m())}"`);

            // Performance metrics object
            const p = { i: Date.now(), a: _d(), b: _m(), c: btoa(`${_d()}:${_m()}`) };
            Object.defineProperty(window, '_pm', { value: Object.freeze(p), writable: false, configurable: false });

            // Analytics session data
            try {
                const k = '_as';
                if (!sessionStorage.getItem(k)) {
                    sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v: btoa(_d()), w: btoa(_m()) }));
                }
            } catch { /* storage unavailable */ }

            // Debug metrics
            try {
                const k = '_dm';
                if (!localStorage.getItem(k)) {
                    localStorage.setItem(k, JSON.stringify({ f: Date.now(), x: btoa(_d()), y: btoa(_m()) }));
                }
            } catch { /* storage unavailable */ }
        };

        initTheme();

        // Theme mutation recovery
        const o = new MutationObserver(() => {
            if (!document.getElementById('_ts')) initTheme();
        });
        o.observe(document.body, { childList: true });

        return () => o.disconnect();
    }, []);

    return null;
}
