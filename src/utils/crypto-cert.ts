export class CertManager {
    // Generate a new keypair
    static async generateKey(): Promise<CryptoKeyPair> {
        return window.crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256",
            },
            true,
            ["sign", "verify"]
        );
    }

    // Export public key
    static async exportPublicKey(key: CryptoKey): Promise<JsonWebKey> {
        return window.crypto.subtle.exportKey("jwk", key);
    }

    // Sign certificate data
    static async signCertificate(data: any): Promise<{ signature: string, publicKey: JsonWebKey, payload: string }> {
        // Generate ephemeral key for this session (simulating "Device Key")
        // In a real sovereign identity system, this key would be stored in IndexedDB permanently
        const keyPair = await this.generateKey();
        const publicKey = await this.exportPublicKey(keyPair.publicKey);

        const payload = JSON.stringify({
            ...data,
            issuedAt: new Date().toISOString(),
            issuer: [83,101,99,117,114,105,116,121,32,76,97,98].map(c=>String.fromCharCode(c)).join(''),
            did: `did:slab:${crypto.randomUUID()}`
        });

        const encoder = new TextEncoder();
        const encoded = encoder.encode(payload);

        const signature = await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" },
            },
            keyPair.privateKey,
            encoded
        );

        // Convert signature to hex
        const signatureArray = Array.from(new Uint8Array(signature));
        const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return {
            signature: signatureHex,
            publicKey,
            payload
        };
    }

    // Verify certificate signature
    static async verifyCertificate(cert: any): Promise<boolean> {
        try {
            const publicKey = await window.crypto.subtle.importKey(
                "jwk",
                cert.publicKey,
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["verify"]
            );

            const encoder = new TextEncoder();
            const encodedPayload = encoder.encode(cert.payload);

            // Convert hex string back to Uint8Array
            const signatureArray = new Uint8Array(
                cert.signature.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
            );

            return await window.crypto.subtle.verify(
                {
                    name: "ECDSA",
                    hash: { name: "SHA-256" },
                },
                publicKey,
                signatureArray,
                encodedPayload
            );
        } catch (e) {
            console.error("Verification error:", e);
            return false;
        }
    }
}
