/**
 * 🔐 GHOST PROTOCOL - Vault Chiffré Local
 * 
 * Système de chiffrement AES-256-GCM pour les données utilisateur.
 * La passphrase ne quitte JAMAIS le navigateur.
 * 
 * @license AGPL-3.0
 */

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

export interface VaultData {
    progress: Record<string, any>;
    notes: Record<string, string>;
    preferences: Record<string, any>;
}

/**
 * Dérive une clé cryptographique depuis une passphrase
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passphraseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as BufferSource,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        passphraseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Chiffre les données avec AES-256-GCM
 */
export async function encryptVault(data: VaultData, passphrase: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(passphrase, salt);

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));

    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
}

/**
 * Déchiffre les données avec AES-256-GCM
 */
export async function decryptVault(encryptedData: string, passphrase: string): Promise<VaultData> {
    try {
        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        const salt = combined.slice(0, SALT_LENGTH);
        const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const data = combined.slice(SALT_LENGTH + IV_LENGTH);

        const key = await deriveKey(passphrase, salt);

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decryptedData);
        return JSON.parse(jsonString);
    } catch (error) {
        throw new Error('Passphrase incorrecte ou données corrompues');
    }
}

/**
 * Sauvegarde le vault chiffré dans localStorage
 */
export async function saveVault(data: VaultData, passphrase: string): Promise<void> {
    const encrypted = await encryptVault(data, passphrase);
    localStorage.setItem('ghost_vault', encrypted);
    // On stocke aussi un hash de la passphrase pour vérification rapide
    const passphraseHash = await hashPassphrase(passphrase);
    localStorage.setItem('ghost_vault_hash', passphraseHash);
}

/**
 * Charge le vault chiffré depuis localStorage
 */
export async function loadVault(passphrase: string): Promise<VaultData | null> {
    const encrypted = localStorage.getItem('ghost_vault');
    if (!encrypted) return null;

    try {
        return await decryptVault(encrypted, passphrase);
    } catch (error) {
        console.error('Échec du déchiffrement:', error);
        return null;
    }
}

/**
 * Vérifie si un vault existe
 */
export function vaultExists(): boolean {
    return localStorage.getItem('ghost_vault') !== null;
}

/**
 * Hash la passphrase pour vérification rapide (sans déchiffrer)
 */
async function hashPassphrase(passphrase: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(passphrase);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Vérifie rapidement si la passphrase est correcte
 */
export async function verifyPassphrase(passphrase: string): Promise<boolean> {
    const storedHash = localStorage.getItem('ghost_vault_hash');
    if (!storedHash) return false;

    const currentHash = await hashPassphrase(passphrase);
    return currentHash === storedHash;
}

/**
 * Détruit le vault (suppression sécurisée)
 */
export function destroyVault(): void {
    localStorage.removeItem('ghost_vault');
    localStorage.removeItem('ghost_vault_hash');
}
