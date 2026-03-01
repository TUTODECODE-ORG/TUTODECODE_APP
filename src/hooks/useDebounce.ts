import { useState, useEffect } from 'react';

/**
 * Hook pour debouncer une valeur
 * Utile pour les champs de recherche
 * 
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes (défaut: 300ms)
 * @returns La valeur debouncée
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 500);
 * 
 * useEffect(() => {
 *   // Cette fonction ne s'exécutera que 500ms après la dernière frappe
 *   fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set un timer pour mettre à jour la valeur après le délai
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Nettoie le timer si value change avant la fin du délai
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
