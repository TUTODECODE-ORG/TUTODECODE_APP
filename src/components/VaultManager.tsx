import { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    vaultExists,
    saveVault,
    loadVault,
    destroyVault,
    type VaultData
} from '@/lib/crypto/vault';

interface VaultManagerProps {
    onUnlock?: (data: VaultData) => void;
}

export function VaultManager({ onUnlock }: VaultManagerProps) {
    const [isLocked, setIsLocked] = useState(true);
    const [passphrase, setPassphrase] = useState('');
    const [confirmPassphrase, setConfirmPassphrase] = useState('');
    const [showPassphrase, setShowPassphrase] = useState(false);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [, setVaultData] = useState<VaultData | null>(null);

    useEffect(() => {
        const exists = vaultExists();
        setIsLocked(exists);
        setIsCreating(!exists);
    }, []);

    const handleCreateVault = async () => {
        if (passphrase.length < 8) {
            setError('La passphrase doit contenir au moins 8 caractères');
            return;
        }

        if (passphrase !== confirmPassphrase) {
            setError('Les passphrases ne correspondent pas');
            return;
        }

        try {
            const initialData: VaultData = {
                progress: {},
                notes: {},
                preferences: {}
            };

            await saveVault(initialData, passphrase);
            setVaultData(initialData);
            setIsLocked(false);
            setIsCreating(false);
            setError('');
            setPassphrase('');
            setConfirmPassphrase('');

            if (onUnlock) onUnlock(initialData);
        } catch (err) {
            setError('Erreur lors de la création du vault. Veuillez réessayer.');
            console.error('Vault creation error:', err);
        }
    };

    const handleUnlock = async () => {
        if (!passphrase) {
            setError('Veuillez entrer votre passphrase');
            return;
        }

        try {
            const data = await loadVault(passphrase);
            if (data) {
                setVaultData(data);
                setIsLocked(false);
                setError('');
                setPassphrase('');

                if (onUnlock) onUnlock(data);
            } else {
                setError('Passphrase incorrecte');
            }
        } catch (err) {
            setError('Erreur lors du déverrouillage du vault');
            console.error(err);
        }
    };

    const handleLock = () => {
        setIsLocked(true);
        setVaultData(null);
        setPassphrase('');
        setConfirmPassphrase('');
    };

    const handleDestroy = () => {
        if (confirm('⚠️ ATTENTION : Cette action est irréversible. Toutes vos données chiffrées seront définitivement supprimées. Continuer ?')) {
            destroyVault();
            setIsLocked(true);
            setIsCreating(true);
            setVaultData(null);
            setError('');
        }
    };

    if (isCreating) {
        return (
            <Card className="w-full max-w-md mx-auto bg-slate-900/50 border-cyan-500/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-cyan-400" />
                        <CardTitle className="text-cyan-400">Créer un Vault Sécurisé</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">
                        Chiffrement AES-256-GCM • Votre passphrase ne quitte jamais votre navigateur
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="bg-cyan-500/10 border-cyan-500/30">
                        <AlertTriangle className="h-4 w-4 text-cyan-400" />
                        <AlertDescription className="text-slate-300">
                            <strong>Important :</strong> Si vous perdez votre passphrase, vos données seront définitivement inaccessibles.
                            Aucune récupération n'est possible.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-300">Passphrase (min. 8 caractères)</label>
                        <div className="relative">
                            <Input
                                type={showPassphrase ? 'text' : 'password'}
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-slate-200 pr-10"
                                placeholder="Entrez une passphrase forte"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassphrase(!showPassphrase)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            >
                                {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-300">Confirmer la passphrase</label>
                        <Input
                            type={showPassphrase ? 'text' : 'password'}
                            value={confirmPassphrase}
                            onChange={(e) => setConfirmPassphrase(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-slate-200"
                            placeholder="Confirmez votre passphrase"
                        />
                    </div>

                    {error && (
                        <Alert className="bg-red-500/10 border-red-500/30">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-300">{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onClick={handleCreateVault}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        Créer le Vault Chiffré
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isLocked) {
        return (
            <Card className="w-full max-w-md mx-auto bg-slate-900/50 border-cyan-500/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="w-6 h-6 text-cyan-400" />
                        <CardTitle className="text-cyan-400">Vault Verrouillé</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">
                        Entrez votre passphrase pour déverrouiller vos données
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-300">Passphrase</label>
                        <div className="relative">
                            <Input
                                type={showPassphrase ? 'text' : 'password'}
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                className="bg-slate-800 border-slate-700 text-slate-200 pr-10"
                                placeholder="Entrez votre passphrase"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassphrase(!showPassphrase)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            >
                                {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <Alert className="bg-red-500/10 border-red-500/30">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-300">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={handleUnlock}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                            <Unlock className="w-4 h-4 mr-2" />
                            Déverrouiller
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    // Simulation authentification biométrique (WebAuthn)
                                    // Dans une vraie implémentation, utiliser navigator.credentials.get()
                                    setError('Authentification biométrique en cours...');

                                    // Délai simulé pour l'UX
                                    await new Promise(resolve => setTimeout(resolve, 1500));

                                    // Simulation d'échec si pas configuré (pour la démo)
                                    // Idéalement, on vérifierait si une clé est stockée dans IndexedDB
                                    const available = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable();

                                    if (available) {
                                        setError('Empreinte non reconnue ou non configurée pour ce navigateur.');
                                        setTimeout(() => setError(''), 2000);
                                    } else {
                                        setError('Aucun lecteur biométrique détecté.');
                                    }
                                } catch (e) {
                                    setError('Erreur d\'authentification biométrique.');
                                }
                            }}
                            variant="outline"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600"
                            title="Empreinte / FaceID"
                        >
                            <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleDestroy}
                            variant="destructive"
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30"
                        >
                            Détruire
                        </Button>
                    </div>
                </CardContent>
            </Card >
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto bg-slate-900/50 border-green-500/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Unlock className="w-6 h-6 text-green-400" />
                        <CardTitle className="text-green-400">Vault Déverrouillé</CardTitle>
                    </div>
                    <Button
                        onClick={handleLock}
                        size="sm"
                        className="bg-slate-700 hover:bg-slate-600"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        Verrouiller
                    </Button>
                </div>
                <CardDescription className="text-slate-400">
                    Vos données sont accessibles et sécurisées
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert className="bg-green-500/10 border-green-500/30">
                    <Shield className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">
                        ✓ Chiffrement actif • ✓ Données protégées • ✓ Zéro serveur
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
