import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Key } from 'lucide-react';
import { SecureCrypto } from '@/lib/crypto-secure';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        name: ''
    });
    const [pbUrl, setPbUrl] = useState('http://127.0.0.1:8090');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [activeTab, setActiveTab] = useState<'login' | 'e2e'>('login');
    const [seedPhrase, setSeedPhrase] = useState('');

    const generateSeed = () => {
        const words = ['cyber', 'ghost', 'neural', 'pulse', 'matrix', 'zero', 'void', 'phantom', 'shadow', 'crypto', 'flux', 'node', 'packet', 'proxy', 'root'];
        const seed = Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
        setSeedPhrase(seed);
    };

    const handleCryptoExport = async () => {
        if (!seedPhrase) return toast.error("Générez une phrase de récupération d'abord.");
        try {
            const data = {
                favorites: localStorage.getItem('favorites'),
                completed: localStorage.getItem('completed'),
                progress: localStorage.getItem('progress')
            };
            const { key } = await SecureCrypto.deriveKeyFromPassword(seedPhrase);
            const encrypted = await SecureCrypto.encrypt(JSON.stringify(data), key);

            // Trigger blob download
            const blob = new Blob([encrypted], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tutodecode-sync-${new Date().getTime()}.blob`;
            a.click();
            toast.success("Progression chiffrée E2E avec succès !");
        } catch (e) {
            toast.error("Erreur chiffrement E2E");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                // Login
                await pb.collection('users').authWithPassword(formData.email, formData.password);
                toast.success(`Bon retour, ${pb.authStore.model?.name || 'Inconnu'} !`);
                onClose();
            } else {
                // Register
                if (formData.password !== formData.passwordConfirm) {
                    throw new Error("Les mots de passe ne correspondent pas");
                }

                // Create user
                const data = {
                    username: formData.email.split('@')[0] + Math.floor(Math.random() * 1000),
                    email: formData.email,
                    emailVisibility: true,
                    password: formData.password,
                    passwordConfirm: formData.passwordConfirm,
                    name: formData.name,
                    data: {} // Initialize empty JSON for sync
                };

                await pb.collection('users').create(data);

                // Auto login after register
                await pb.collection('users').authWithPassword(formData.email, formData.password);
                toast.success("Compte créé avec succès ! Bienvenue à bord.");
                onClose();
            }
        } catch (error: any) {
            console.error(error);
            let msg = error.message || "Une erreur est survenue";
            if (error?.status === 400) msg = "Email ou mot de passe incorrect / déjà utilisé.";
            if (error?.status === 0) msg = "Serveur PocketBase inaccessible (Vérifiez le terminal).";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <div className="flex gap-4 mb-4 border-b border-zinc-800 pb-2">
                        <button
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'login' ? 'text-indigo-400 border-b-2 border-indigo-' : 'text-zinc-500'}`}
                            onClick={() => setActiveTab('login')}
                        >
                            PocketBase (Local)
                        </button>
                        <button
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'e2e' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-zinc-500'}`}
                            onClick={() => setActiveTab('e2e')}
                        >
                            Sync E2E (Zero-Knowledge)
                        </button>
                    </div>
                </DialogHeader>

                {activeTab === 'e2e' ? (
                    <div className="space-y-6 py-4 animate-in fade-in duration-300">
                        <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                            Synchronisation Zero-Knowledge E2EE
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 text-sm">
                            Générez une "Seed Phrase" pour chiffrer votre progression localement avant export.
                            Vos données sont protégées par chiffrement AES-GCM.
                        </DialogDescription>

                        <div className="space-y-4">
                            <div className="bg-zinc-950 p-4 rounded-lg border border-purple-500/30 relative">
                                <label className="text-xs text-purple-400 uppercase font-bold absolute -top-2 left-3 bg-zinc-900 px-1">Phrase de Récupération</label>
                                <textarea
                                    readOnly
                                    className="w-full bg-transparent text-zinc-300 font-mono text-sm outline-none resize-none"
                                    value={seedPhrase}
                                    placeholder="Cliquez sur 'Générer'..."
                                    rows={2}
                                />
                                <Button size="sm" onClick={generateSeed} className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-500 h-6 text-[10px]">
                                    Générer
                                </Button>
                            </div>

                            <Button
                                onClick={handleCryptoExport}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white gap-2"
                                disabled={!seedPhrase}
                            >
                                <Key className="w-4 h-4" /> Sauvegarder (Blob Chiffré)
                            </Button>

                            <div className="text-xs text-center text-zinc-500 mt-2 flex flex-col gap-1 border-t border-zinc-800 pt-4">
                                <span>Exportez votre blob et transmettez-le via <strong className="text-zinc-400">P2P Ghost Mode</strong> ou un <strong>Gist Secret</strong>.</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo- to-indigo-">
                            {isLogin ? 'Connexion Serveur (PocketBase)' : 'Créer un compte Local'}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 text-sm">
                            {isLogin
                                ? 'Synchronisez avec votre instance locale (127.0.0.1:8090).'
                                : 'Les comptes sont stockés dans votre base de données locale (pb_data). Aucune donnée ne part dans le cloud public.'}
                        </DialogDescription>

                        <form onSubmit={handleSubmit} className="space-y-4 py-4 animate-in fade-in duration-300">

                            {/* Advanced Server Settings */}
                            <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                                <div
                                    className="flex items-center justify-between text-xs text-zinc-500 cursor-pointer hover:text-indigo-400"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <span>Configuration Serveur</span>
                                    <span>{showAdvanced ? 'Masquer' : 'Modifier'}</span>
                                </div>

                                {showAdvanced && (
                                    <div className="mt-2 text-xs">
                                        <label className="block text-zinc-400 mb-1">Adresse du Serveur (Host)</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={pbUrl}
                                                onChange={(e) => {
                                                    setPbUrl(e.target.value);
                                                    // Update PB instance dynamically (Dirty but works for now)
                                                    pb.baseUrl = e.target.value;
                                                }}
                                                className="h-8 text-xs bg-zinc-900 border-zinc-700 font-mono"
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1">Par défaut: http://127.0.0.1:8090 (Localhost)</p>
                                    </div>
                                )}
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                        <Input
                                            placeholder="Pseudo"
                                            className="pl-9 bg-zinc-950 border-zinc-800 focus:border-indigo-500"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        className="pl-9 bg-zinc-950 border-zinc-800 focus:border-indigo-500"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        type="password"
                                        placeholder="Mot de passe"
                                        className="pl-9 bg-zinc-950 border-zinc-800 focus:border-indigo-500"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                        <Input
                                            type="password"
                                            placeholder="Confirmer mot de passe"
                                            className="pl-9 bg-zinc-950 border-zinc-800 focus:border-indigo-500"
                                            value={formData.passwordConfirm}
                                            onChange={e => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-indigo-500 hover:bg-indigo-500 text-white font-bold h-11"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? 'Se connecter' : 'Créer un compte')}
                            </Button>
                        </form>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-800" />
                            </div>
                        </div>

                        <div className="text-center text-sm text-zinc-400 mt-4">
                            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-indigo-400 hover:text-indigo-400 font-semibold hover:underline"
                            >
                                {isLogin ? "S'inscrire" : "Se connecter"}
                            </button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
