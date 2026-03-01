/**
 * Sovereign Certificate System (v3.0)
 * Uses WebCrypto API to sign certificates locally.
 */

export interface CertificateData {
    userName: string;
    courseTitle: string;
    roadmap: string;
    date: string;
    issuer: string;
}

export class CryptoSigner {
    private static ALGORITHM = {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
    };

    /**
     * Generates a local identity (Public/Private Key)
     * In a real app, the private key would be stored in IndexedDB (non-exportable if possible)
     */
    static async generateIdentity() {
        return await window.crypto.subtle.generateKey(
            this.ALGORITHM,
            true, // extractable
            ["sign", "verify"]
        );
    }

    /**
     * Signs a completion certificate
     */
    static async signCertificate(data: CertificateData, privateKey: CryptoKey) {
        const encoder = new TextEncoder();
        const message = encoder.encode(JSON.stringify(data));
        const signature = await window.crypto.subtle.sign(
            this.ALGORITHM.name,
            privateKey,
            message
        );

        return {
            data,
            signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
        };
    }

    /**
     * Verifies a certificate signature
     */
    static async verifyCertificate(cert: { data: CertificateData; signature: string }, publicKey: CryptoKey) {
        const encoder = new TextEncoder();
        const message = encoder.encode(JSON.stringify(cert.data));
        const signatureBytes = new Uint8Array(
            atob(cert.signature).split("").map(c => c.charCodeAt(0))
        );

        return await window.crypto.subtle.verify(
            this.ALGORITHM.name,
            publicKey,
            signatureBytes,
            message
        );
    }
}
