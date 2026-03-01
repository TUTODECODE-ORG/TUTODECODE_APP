import { useEffect, useState } from 'react';

/**
 * Hook pour synchroniser le thème avec l'heure du jour
 * Mode sombre automatique la nuit (19h-7h)
 */
export function useThemeSync() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme-mode');
        if (saved) return saved === 'dark';

        // Default to dark mode for the 'hacker/cyberpunk' aesthetic
        return true;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.remove('light');
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
        localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    }, [isDark]);

    // Check every hour for auto theme change
    useEffect(() => {
        const interval = setInterval(() => {
            const hour = new Date().getHours();
            const shouldBeDark = hour >= 19 || hour < 7;
            const autoMode = localStorage.getItem('theme-auto') !== 'false';

            if (autoMode && shouldBeDark !== isDark) {
                setIsDark(shouldBeDark);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [isDark]);

    return { isDark, setIsDark };
}
