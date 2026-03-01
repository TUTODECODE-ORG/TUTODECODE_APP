import { useState } from 'react';
import { CertManager } from '@/utils/crypto-cert';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ShieldCheck, FileCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CertificateVault() {
    const [cert, setCert] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateMyCert = async () => {
        setIsGenerating(true);
        try {
            // Mock data from user progress matching requested format
            const data = {
                student: "Ghost Operative",
                achievement: "Master of TutoDecode",
                skills: ["React", "WebGhost", "CyberSec"],
                score: 100,
                issuedAt: new Date().toISOString(),
                issuer: "TutoDecode Self-Sovereign Engine v1.0",
                did: `did:tutodecode:${crypto.randomUUID()}`
            };

            const signedCert = await CertManager.signCertificate(data);
            setCert(signedCert);
            toast.success("Certificat chiffré généré localement !");
        } catch (e) {
            console.error(e);
            toast.error("Erreur crypto");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-full mb-4 ring-1 ring-purple-500/50">
                    <ShieldCheck className="w-8 h-8 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Vault de Certification
                </h1>
                <p className="text-zinc-400 mt-2">
                    Vos diplômes sont signés cryptographiquement et vous appartiennent.
                    <br />
                    <span className="text-xs font-mono text-zinc-500">ECDSA P-256 Signature • Local Key Storage</span>
                </p>
            </div>

            {!cert && (
                <div className="flex flex-col gap-4 items-center justify-center">
                    <Button
                        onClick={generateMyCert}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-8 px-10 text-lg shadow-xl shadow-purple-500/20 w-full max-w-sm"
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Signature en cours...' : 'Générer mon Certificat Souverain'}
                    </Button>

                    <div className="relative w-full max-w-sm">
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                    try {
                                        const json = JSON.parse(event.target?.result as string);
                                        // Cryptographic validation
                                        if (json.payload && json.signature && json.publicKey) {
                                            const isValid = await CertManager.verifyCertificate(json);
                                            if (isValid) {
                                                setCert(json);
                                                toast.success("Certificat Authentique & Vérifié par la cryptographie (ECDSA P-256) !");
                                            } else {
                                                toast.error("Signature invalide ! Le fichier a été falsifié.");
                                            }
                                        } else {
                                            toast.error("Format de certificat invalide ou corrompu");
                                        }
                                    } catch (err) {
                                        toast.error("Fichier corrompu");
                                    }
                                };
                                reader.readAsText(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" className="w-full border-dashed border-zinc-700 hover:bg-zinc-800 text-zinc-400">
                            Importer un Certificat (Vérification)
                        </Button>
                    </div>
                </div>
            )}

            {cert && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                    <Card className="bg-zinc-900 border-2 border-purple-500/50 p-8 relative overflow-hidden">
                        {/* Watermark */}
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileCheck className="w-32 h-32 text-purple-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                                <span className="text-green-400 font-mono text-sm">CRYPTOGRAPHICALLY VERIFIED</span>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Certificat de Maîtrise</h2>
                            <p className="text-zinc-400 mb-8 max-w-lg">
                                Ce document atteste que l'utilisateur détient la clé privée correspondant à la réussite du parcours.
                                <br />
                                <span className="text-xs text-red-400 italic">Toute modification du fichier JSON invalidera la signature.</span>
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-black/50 p-4 rounded border border-white/10">
                                    <h4 className="text-xs text-zinc-500 uppercase mb-2">Payload (Données)</h4>
                                    <pre className="text-xs text-green-400 font-mono overflow-auto max-h-32 whitespace-pre-wrap">
                                        {/* Attempt to parse if string, else stringify */}
                                        {typeof cert.payload === 'string'
                                            ? JSON.stringify(JSON.parse(cert.payload), null, 2)
                                            : JSON.stringify(cert.payload, null, 2)}
                                    </pre>
                                </div>
                                <div className="bg-black/50 p-4 rounded border border-white/10">
                                    <h4 className="text-xs text-zinc-500 uppercase mb-2">Signature ECDSA</h4>
                                    <div className="text-xs text-purple-400 font-mono break-all leading-relaxed">
                                        {cert.signature}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-white/10">
                                <div className="text-xs text-zinc-500 font-mono">
                                    Issuer: TutoDecode Engine<br />
                                    Timestamp: {new Date().toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setCert(null)}>
                                        Fermer
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'certificate-sovereign.json';
                                        a.click();
                                    }}>
                                        Télécharger JSON (Proof)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
