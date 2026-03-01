/**
 * 🛡️ Service Worker Integrity Verification
 * 
 * Système Zero-Trust pour vérifier que le cache du Service Worker
 * n'a pas été corrompu ou modifié par un attaquant.
 * 
 * @license AGPL-3.0
 */

export interface IntegrityManifest {
    version: string;
    timestamp: number;
    files: Record<string, string>; // filename -> SHA-256 hash
}

export class IntegrityChecker {
    private static readonly MANIFEST_KEY = 'sw-integrity-manifest';
    private static readonly MANIFEST_VERSION = '1.0.0';

    /**
     * Génère un manifest d'intégrité pour les fichiers critiques
     * @param files - Liste des fichiers à inclure dans le manifest
     */
    static async generateManifest(files: string[]): Promise<IntegrityManifest> {
        const fileHashes: Record<string, string> = {};

        for (const file of files) {
            try {
                const hash = await this.hashFile(file);
                fileHashes[file] = hash;
                console.log(`✅ Hashed: ${file} -> ${hash.substring(0, 16)}...`);
            } catch (error) {
                console.error(`❌ Failed to hash ${file}:`, error);
                throw new Error(`Integrity manifest generation failed for ${file}`);
            }
        }

        const manifest: IntegrityManifest = {
            version: this.MANIFEST_VERSION,
            timestamp: Date.now(),
            files: fileHashes
        };

        // Stocke le manifest dans localStorage
        localStorage.setItem(this.MANIFEST_KEY, JSON.stringify(manifest));

        return manifest;
    }

    /**
     * Calcule le hash SHA-256 d'un fichier
     */
    private static async hashFile(url: string): Promise<string> {
        const response = await fetch(url, { cache: 'no-cache' });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Vérifie l'intégrité de tous les fichiers du manifest
     */
    static async verifyIntegrity(manifest?: IntegrityManifest): Promise<{
        valid: boolean;
        corruptedFiles: string[];
    }> {
        // Récupère le manifest stocké si non fourni
        const actualManifest = manifest || this.getStoredManifest();

        if (!actualManifest) {
            console.warn('⚠️ No integrity manifest found');
            return { valid: true, corruptedFiles: [] }; // Pas de manifest = pas de vérification
        }

        const corruptedFiles: string[] = [];

        for (const [file, expectedHash] of Object.entries(actualManifest.files)) {
            try {
                const actualHash = await this.hashFile(file);

                if (actualHash !== expectedHash) {
                    console.error(`🚨 INTEGRITY VIOLATION: ${file}`);
                    console.error(`   Expected: ${expectedHash}`);
                    console.error(`   Got:      ${actualHash}`);
                    corruptedFiles.push(file);
                } else {
                    console.log(`✅ Integrity OK: ${file}`);
                }
            } catch (error) {
                console.error(`❌ Failed to verify ${file}:`, error);
                corruptedFiles.push(file);
            }
        }

        return {
            valid: corruptedFiles.length === 0,
            corruptedFiles
        };
    }

    /**
     * Récupère le manifest stocké
     */
    static getStoredManifest(): IntegrityManifest | null {
        const manifestStr = localStorage.getItem(this.MANIFEST_KEY);

        if (!manifestStr) {
            return null;
        }

        try {
            return JSON.parse(manifestStr) as IntegrityManifest;
        } catch (error) {
            console.error('Failed to parse integrity manifest:', error);
            return null;
        }
    }

    /**
     * Vérifie l'intégrité au démarrage de la PWA
     * Si la vérification échoue, vide le cache et recharge
     */
    static async checkOnStartup(): Promise<void> {
        console.log('🔍 Starting integrity check...');

        const result = await this.verifyIntegrity();

        if (!result.valid) {
            console.error('🚨 INTEGRITY CHECK FAILED');
            console.error('Corrupted files:', result.corruptedFiles);

            // Affiche un avertissement à l'utilisateur
            const shouldClear = confirm(
                `⚠️ ALERTE SÉCURITÉ\n\n` +
                `Le cache de l'application a été corrompu ou modifié.\n\n` +
                `Fichiers affectés:\n${result.corruptedFiles.join('\n')}\n\n` +
                `Pour votre sécurité, nous recommandons de vider le cache.\n\n` +
                `Vider le cache et recharger ?`
            );

            if (shouldClear) {
                await this.clearCacheAndReload();
            }
        } else {
            console.log('✅ Integrity check passed - All files are valid');
        }
    }

    /**
     * Vide tous les caches et recharge l'application
     */
    static async clearCacheAndReload(): Promise<void> {
        console.log('🧹 Clearing all caches...');

        try {
            // Désinscrire tous les Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                    console.log('✅ Unregistered Service Worker');
                }
            }

            // Vider tous les caches
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log(`✅ Deleted ${cacheNames.length} caches`);

            // Vider le localStorage (sauf le manifest pour la prochaine fois)
            const manifest = localStorage.getItem(this.MANIFEST_KEY);
            localStorage.clear();
            if (manifest) {
                localStorage.setItem(this.MANIFEST_KEY, manifest);
            }

            // Recharger la page
            console.log('🔄 Reloading application...');
            window.location.reload();
        } catch (error) {
            console.error('Failed to clear cache:', error);
            alert('Impossible de vider le cache. Veuillez vider manuellement le cache du navigateur.');
        }
    }

    /**
     * Génère un manifest pour les fichiers critiques de l'application
     */
    static async generateDefaultManifest(): Promise<IntegrityManifest> {
        const criticalFiles = [
            '/index.html',
            '/assets/index.js',
            '/assets/index.css',
            '/manifest.json',
            '/sw.js'
        ];

        return await this.generateManifest(criticalFiles);
    }

    /**
     * Active la vérification automatique périodique
     * @param intervalMinutes - Intervalle en minutes entre chaque vérification
     */
    static enablePeriodicCheck(intervalMinutes: number = 60): void {
        setInterval(async () => {
            console.log('🔍 Periodic integrity check...');
            const result = await this.verifyIntegrity();

            if (!result.valid) {
                console.error('🚨 Periodic check failed:', result.corruptedFiles);
                // Optionnel: Notifier l'utilisateur
            }
        }, intervalMinutes * 60 * 1000);
    }

    /**
     * Vérifie si un fichier spécifique est corrompu
     */
    static async verifyFile(filename: string): Promise<boolean> {
        const manifest = this.getStoredManifest();

        if (!manifest || !manifest.files[filename]) {
            console.warn(`No hash found for ${filename}`);
            return true; // Pas de hash = on fait confiance
        }

        try {
            const actualHash = await this.hashFile(filename);
            const expectedHash = manifest.files[filename];

            return actualHash === expectedHash;
        } catch (error) {
            console.error(`Failed to verify ${filename}:`, error);
            return false;
        }
    }

    /**
     * Met à jour le hash d'un fichier dans le manifest
     * Utile après une mise à jour légitime
     */
    static async updateFileHash(filename: string): Promise<void> {
        const manifest = this.getStoredManifest();

        if (!manifest) {
            throw new Error('No manifest found');
        }

        const newHash = await this.hashFile(filename);
        manifest.files[filename] = newHash;
        manifest.timestamp = Date.now();

        localStorage.setItem(this.MANIFEST_KEY, JSON.stringify(manifest));
        console.log(`✅ Updated hash for ${filename}`);
    }
}

/**
 * Exemple d'utilisation :
 * 
 * // Au build de production, générer le manifest
 * await IntegrityChecker.generateDefaultManifest();
 * 
 * // Au démarrage de l'application
 * await IntegrityChecker.checkOnStartup();
 * 
 * // Activer la vérification périodique (toutes les heures)
 * IntegrityChecker.enablePeriodicCheck(60);
 * 
 * // Vérifier un fichier spécifique
 * const isValid = await IntegrityChecker.verifyFile('/assets/index.js');
 */
