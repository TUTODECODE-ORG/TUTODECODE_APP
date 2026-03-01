/**
 * 🔐 Secure Cryptography with Web Crypto API
 * 
 * Utilise l'API native du navigateur pour générer des clés AES-256-GCM non-extractibles.
 * Les clés ne peuvent jamais être exportées, ce qui empêche leur vol via le code JavaScript.
 * 
 * @license AGPL-3.0
 */

export class SecureCrypto {
    private static readonly KEY_STORE_NAME = 'secure-keys';
    private static readonly DB_NAME = 'crypto-db';
    private static readonly DB_VERSION = 1;

    /**
     * Génère une clé AES-GCM 256-bit non-extractible
     * Cette clé ne peut JAMAIS être exportée du navigateur
     */
    static async generateKey(): Promise<CryptoKey> {
        return await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            false, // extractable = false → clé non-extractible !
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Chiffre des données avec AES-256-GCM
     * @param data - Données à chiffrer (string)
     * @param key - Clé CryptoKey non-extractible
     * @returns Données chiffrées en base64 (IV + ciphertext)
     */
    static async encrypt(data: string, key: CryptoKey): Promise<string> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        // Génère un IV aléatoire de 12 bytes (96 bits) pour GCM
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Chiffrement AES-GCM
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128 // Tag d'authentification de 128 bits
            },
            key,
            dataBuffer
        );

        // Combine IV + encrypted data pour le stockage
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        // Encode en base64 pour le stockage
        return btoa(String.fromCharCode(...combined));
    }

    /**
     * Déchiffre des données avec AES-256-GCM
     * @param encryptedData - Données chiffrées en base64
     * @param key - Clé CryptoKey non-extractible
     * @returns Données déchiffrées (string)
     */
    static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
        // Décode le base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Extrait l'IV (12 premiers bytes)
        const iv = combined.slice(0, 12);
        // Extrait les données chiffrées (reste)
        const data = combined.slice(12);

        // Déchiffrement AES-GCM
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128
            },
            key,
            data
        );

        // Décode le buffer en string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    }

    /**
     * Stocke une clé dans IndexedDB
     * Note: Même en IndexedDB, la clé reste non-extractible
     */
    static async storeKey(keyId: string, key: CryptoKey): Promise<void> {
        const db = await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.KEY_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.KEY_STORE_NAME);

            const request = store.put({ id: keyId, key: key });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Récupère une clé depuis IndexedDB
     */
    static async getKey(keyId: string): Promise<CryptoKey | null> {
        const db = await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.KEY_STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.KEY_STORE_NAME);

            const request = store.get(keyId);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.key : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Ouvre la base de données IndexedDB
     */
    private static async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(this.KEY_STORE_NAME)) {
                    db.createObjectStore(this.KEY_STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Génère un hash SHA-256 d'une chaîne
     * Utile pour vérifier l'intégrité des données
     */
    static async hash(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Génère une clé de dérivation à partir d'un mot de passe (PBKDF2)
     * Utile pour créer des clés à partir de mots de passe utilisateur
     */
    static async deriveKeyFromPassword(
        password: string,
        salt?: Uint8Array
    ): Promise<{ key: CryptoKey; salt: Uint8Array }> {
        // Génère un salt aléatoire si non fourni
        const actualSalt = salt || window.crypto.getRandomValues(new Uint8Array(16));

        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        // Import le mot de passe comme clé de base
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveKey']
        );

        // Dérive une clé AES-GCM à partir du mot de passe
        const derivedKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: actualSalt as unknown as BufferSource,
                iterations: 100000, // 100k itérations pour ralentir les attaques
                hash: 'SHA-256'
            },
            baseKey,
            {
                name: 'AES-GCM',
                length: 256
            },
            false, // Non-extractible !
            ['encrypt', 'decrypt']
        );

        return { key: derivedKey, salt: actualSalt };
    }

    /**
     * Vérifie si Web Crypto API est disponible
     */
    static isSupported(): boolean {
        return !!(window.crypto && window.crypto.subtle);
    }

    /**
     * Génère un identifiant unique sécurisé
     */
    static generateId(): string {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    }
}

/**
 * Exemple d'utilisation :
 * 
 * // Générer une clé
 * const key = await SecureCrypto.generateKey();
 * 
 * // Stocker la clé
 * await SecureCrypto.storeKey('my-key', key);
 * 
 * // Chiffrer des données
 * const encrypted = await SecureCrypto.encrypt('Secret data', key);
 * 
 * // Déchiffrer des données
 * const decrypted = await SecureCrypto.decrypt(encrypted, key);
 * 
 * // Générer un hash
 * const hash = await SecureCrypto.hash('data to hash');
 */
