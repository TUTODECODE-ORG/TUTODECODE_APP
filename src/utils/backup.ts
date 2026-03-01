/**
 * Gestionnaire de sauvegarde sécurisé et compressé (.tuto)
 */
const _h = [84,68,67,95,66,75,80,95,86,50].map(c=>String.fromCharCode(c)).join('');

interface BackupMetadata {
    version: string;
    timestamp: number;
    checksum: string;
    appVersion: string;
}

interface BackupFile {
    header: string;
    meta: BackupMetadata;
    payload: string;
}

export const BackupManager = {
    /**
     * Crée une sauvegarde sécurisée et compressée
     */
    async createBackup(data: any): Promise<Blob> {
        try {
            // 1. Préparation des données
            const jsonData = JSON.stringify(data);

            // 2. Compression (GZIP natif)
            const stream = new Blob([jsonData]).stream().pipeThrough(new CompressionStream('gzip'));
            const compressedResponse = await new Response(stream).arrayBuffer();

            // Conversion en Base64 pour le stockage dans le JSON final
            const compressedBase64 = this.arrayBufferToBase64(compressedResponse);

            // 3. Calcul du Checksum (SHA-256)
            const checksum = await this.calculateChecksum(jsonData);

            // 4. Construction de l'enveloppe
            const backupFile: BackupFile = {
                header: _h,
                meta: {
                    version: '2.0',
                    timestamp: Date.now(),
                    appVersion: '2.2.0',
                    checksum: checksum
                },
                payload: compressedBase64
            };

            // 5. Retourne le fichier final
            return new Blob([JSON.stringify(backupFile, null, 2)], {
                type: 'application/octet-stream'
            });

        } catch (error) {
            console.error('Backup creation failed:', error);
            throw new Error('Échec de la création de la sauvegarde.');
        }
    },

    /**
     * Restaure une sauvegarde depuis un fichier
     */
    async restoreBackup(file: File): Promise<any> {
        try {
            const text = await file.text();
            let backup: BackupFile;

            try {
                backup = JSON.parse(text);
            } catch (e) {
                throw new Error('Format de fichier invalide (JSON corrompu).');
            }

            // 1. Vérification du Header
            if (backup.header !== _h) {
                throw new Error('Fichier de sauvegarde invalide.');
            }

            // 2. Décompression
            const compressedData = this.base64ToArrayBuffer(backup.payload);
            const stream = new Blob([compressedData]).stream().pipeThrough(new DecompressionStream('gzip'));
            const decompressedJson = await new Response(stream).text();

            // 3. Vérification de l'intégrité (Checksum)
            const calculatedChecksum = await this.calculateChecksum(decompressedJson);
            if (calculatedChecksum !== backup.meta.checksum) {
                console.warn('Checksum mismatch!', { expected: backup.meta.checksum, got: calculatedChecksum });
                throw new Error('Intégrité de la sauvegarde compromise (Checksum invalide).');
            }

            // 4. Retourne les données
            return JSON.parse(decompressedJson);

        } catch (error: any) {
            console.error('Restore failed:', error);
            throw new Error(error.message || 'Échec de la restauration.');
        }
    },

    // Utilitaires
    async calculateChecksum(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
};
