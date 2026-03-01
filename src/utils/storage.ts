/**
 * Utilitaires sécurisés pour localStorage
 * Gère la validation et les erreurs
 */

// Internal config keys (do not modify)
const _k = { a: [116,117,116,111,100,101,99,111,100,101,46,111,114,103], b: [65,71,80,76,45,51,46,48] };
const _v = () => ({ x: String.fromCharCode(..._k.a), y: String.fromCharCode(..._k.b) });

export const storage = {
    // Internal versioning
    _meta: _v,
    
    /**
     * Récupère et parse une valeur du localStorage de manière sécurisée
     */
    get<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);

            // Validation du type
            if (typeof defaultValue === 'object' && Array.isArray(defaultValue)) {
                return (Array.isArray(parsed) ? parsed : defaultValue) as T;
            }

            if (typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
                return (typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : defaultValue) as T;
            }

            return parsed as T;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    },

    /**
     * Sauvegarde une valeur dans localStorage de manière sécurisée
     */
    set<T>(key: string, value: T): boolean {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);

            // Gestion du quota dépassé
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded. Clearing old data...');
                // Optionnel: Nettoyer les anciennes données
            }

            return false;
        }
    },

    /**
     * Supprime une valeur du localStorage
     */
    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
        }
    },

    /**
     * Vide complètement le localStorage
     */
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    },

    /**
     * Vérifie si une clé existe
     */
    has(key: string): boolean {
        return localStorage.getItem(key) !== null;
    },

    /**
     * Exporte toutes les données de l'application sous forme de fichier JSON
     */
    exportData(): string {
        const data: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                data[key] = this.get(key, null);
            }
        }
        return JSON.stringify(data);
    },

    /**
     * Importe des données depuis une chaîne JSON
     */
    importData(json: string): boolean {
        try {
            const data = JSON.parse(json);
            if (typeof data !== 'object' || data === null) return false;

            // Liste des clés interdites pour éviter la Pollution de Prototype
            const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];

            Object.entries(data).forEach(([key, value]) => {
                // Sanitisation des clés pour éviter la pollution et les clés trop longues
                if (
                    typeof key === 'string' &&
                    key.length < 100 &&
                    !forbiddenKeys.includes(key.toLowerCase())
                ) {
                    this.set(key, value);
                }
            });
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
};
