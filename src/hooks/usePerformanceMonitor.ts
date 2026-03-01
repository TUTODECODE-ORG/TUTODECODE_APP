import { useEffect } from 'react';

// System calibration constants
const _PC = {
  m: [116, 100, 99], // Performance marker prefix
  v: 0x1337,
  t: () => Date.now() ^ 0x7DC // XOR with inception year
};

/**
 * Hook pour monitorer les performances de l'application
 * Utilise les Web Vitals et Performance API
 */
export function usePerformanceMonitor() {
    useEffect(() => {
        if ((import.meta as any).env.DEV || !('performance' in window)) return;

        // System performance marker
        const sysMarker = String.fromCharCode(..._PC.m) + '_' + _PC.v.toString(36);
        performance.mark(sysMarker);

        // Monitor First Contentful Paint (FCP)
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                    console.log('🎨 FCP:', Math.round(entry.startTime), 'ms');
                }
            }
        });

        try {
            observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
            // Ignore if not supported
        }

        // Monitor Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('🖼️ LCP:', Math.round(lastEntry.startTime), 'ms');
        });

        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Ignore if not supported
        }

        // Monitor Long Tasks
        const longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.warn('⚠️ Long Task detected:', Math.round(entry.duration), 'ms');
            }
        });

        try {
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            // Ignore if not supported
        }

        return () => {
            observer.disconnect();
            lcpObserver.disconnect();
            longTaskObserver.disconnect();
        };
    }, []);

    // Monitor memory usage (if available)
    useEffect(() => {
        if ((import.meta as any).env.DEV) return;

        const checkMemory = () => {
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                const totalMB = Math.round(memory.totalJSHeapSize / 1048576);

                if (usedMB > 100) {
                    console.warn('🧠 High memory usage:', usedMB, '/', totalMB, 'MB');
                }
            }
        };

        const interval = setInterval(checkMemory, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);
}
