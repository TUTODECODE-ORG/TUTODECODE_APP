import { Settings, Trash2, Database, Bell, Moon, Sun, Globe, Download, Upload, ShieldCheck, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { OfflineManager } from './OfflineManager';
import { useState, useRef } from 'react';
import type { Course } from '@/types';
import { storage } from '@/utils/storage';
import { toast } from 'sonner';

interface SettingsPageProps {
    courses: Course[];
    onClose: () => void;
}

export function SettingsPage({ courses, onClose }: SettingsPageProps) {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [notifications, setNotifications] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [licenseKey, setLicenseKey] = useState(localStorage.getItem('license_key') || '');
    const [licenseStatus, setLicenseStatus] = useState<'free' | 'pro'>(localStorage.getItem('license_key') ? 'pro' : 'free');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerifyLicense = () => {
        setIsVerifying(true);
        // Simulation d'une vérification serveur
        setTimeout(() => {
            const cleanKey = licenseKey.trim().toUpperCase();
            // Accepte les clés de l'Easter Egg (GHOST-XXXX-XXXX-XXXX-PRO) et les clés PRO classiques
            if (cleanKey.startsWith('PRO-') || (cleanKey.startsWith('GHOST-') && cleanKey.endsWith('-PRO'))) {
                setLicenseStatus('pro');
                localStorage.setItem('license_key', cleanKey);
                toast.success("Licence PRO activée avec succès !");
            } else {
                toast.error("Clé de licence invalide.");
            }
            setIsVerifying(false);
        }, 1500);
    };

    const handleToggleTheme = () => {
        const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);

        // Appliquer le thème
        document.documentElement.classList.remove('light', 'dark');
        if (nextTheme !== 'system') {
            document.documentElement.classList.add(nextTheme);
        }
    };

    const handleExport = () => {
        const data = storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghost-framework-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Progression exportée avec succès !");
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const success = storage.importData(content);
            if (success) {
                toast.success("Progression restaurée ! Redémarrage...");
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error("Fichier de sauvegarde invalide ou corrompu.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings className="h-8 w-8" />
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">Paramètres</h1>
                            </div>
                            <p className="text-muted-foreground">
                                Gérez vos préférences et le mode hors ligne
                            </p>
                        </div>
                    </div>

                    <Button onClick={onClose} variant="outline">
                        Fermer
                    </Button>
                </div>

                {/* Mode Offline */}
                <OfflineManager courses={courses} />

                {/* Backup & Recovery */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Sauvegarde & Restauration
                        </CardTitle>
                        <CardDescription>
                            Transférez votre progression ou créez une sauvegarde de sécurité
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                            <div className="flex items-center gap-2 font-medium">
                                <Download className="h-4 w-4 text-blue-500" />
                                Exporter
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Téléchargez un fichier JSON contenant tous vos favoris, XP et progression.
                            </p>
                            <Button variant="outline" size="sm" className="w-full" onClick={handleExport}>
                                Télécharger la sauvegarde
                            </Button>
                        </div>

                        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                            <div className="flex items-center gap-2 font-medium">
                                <Upload className="h-4 w-4 text-green-500" />
                                Importer
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Restaurez votre progression à partir d'un fichier de sauvegarde précédemment exporté.
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Sélectionner un fichier
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Licence */}
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-500">
                            <ShieldCheck className="h-5 w-5" />
                            Licence & Activation
                        </CardTitle>
                        <CardDescription>
                            Activez votre version PRO pour débloquer les rapports PDF et le mode expert.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-yellow-500/20">
                                <div>
                                    <h4 className="font-semibold text-slate-200">Statut de la licence</h4>
                                    <p className="text-sm text-green-400 font-bold tracking-wide">
                                        {licenseStatus === 'pro' ? 'Licence PRO Active' : 'Version Gratuite'}
                                    </p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${licenseStatus === 'pro' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                    {licenseStatus === 'pro' ? 'ACTIVÉ' : 'FREE TIER'}
                                </div>
                            </div>

                            {licenseStatus !== 'pro' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <h4 className="text-sm font-semibold text-yellow-500 mb-2">Pourquoi passer PRO ?</h4>
                                        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                                            <li>Accès illimité aux rapports PDF</li>
                                            <li>Mode Expert & Terminal avancé</li>
                                            <li>Support prioritaire</li>
                                            <li>Mises à jour exclusives</li>
                                        </ul>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Entrez votre clé (ex: PRO-XXXX-XXXX)"
                                            className="flex-1 bg-background border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                            value={licenseKey}
                                            onChange={(e) => setLicenseKey(e.target.value)}
                                        />
                                        <Button onClick={handleVerifyLicense} disabled={isVerifying || !licenseKey} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                            {isVerifying ? 'Vérification...' : 'Activer'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {licenseStatus === 'pro' && (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-green-400 mb-1">Toutes les fonctionnalités PRO sont débloquées.</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Merci de soutenir le développement de Ghost Framework. Vous avez accès à l'intégralité du contenu, aux outils avancés et aux futures mises à jour PRO.
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <Button size="sm" variant="outline" className="text-xs h-7 border-green-500/30 hover:bg-green-500/10 text-green-400">
                                                Gérer ma licence
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-xs h-7 border-green-500/30 hover:bg-green-500/10 text-green-400">
                                                Télécharger facture
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Autres paramètres */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Préférences & Interface
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Thème */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                {theme === 'light' && <Sun className="h-5 w-5" />}
                                {theme === 'dark' && <Moon className="h-5 w-5" />}
                                {theme === 'system' && <Settings className="h-5 w-5" />}
                                <div>
                                    <h4 className="font-medium">Thème</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Actuellement : {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleToggleTheme}>
                                Changer
                            </Button>
                        </div>

                        {/* Mode Pro (Minimaliste) */}
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-900/50 border-cyan-900/30">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-cyan-500/10 flex items-center justify-center">
                                    {licenseStatus === 'pro' ? (
                                        <span className="text-xs font-bold text-cyan-500">PRO</span>
                                    ) : (
                                        <Lock className="h-4 w-4 text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-cyan-400">Mode Pro / Minimaliste</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Désactive les animations et les particules pour plus de rapidité.
                                        {licenseStatus !== 'pro' && <span className="text-yellow-500 ml-1">(Requis Licence)</span>}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={localStorage.getItem('pro_mode') === 'true'}
                                disabled={licenseStatus !== 'pro'}
                                onCheckedChange={(checked) => {
                                    localStorage.setItem('pro_mode', String(checked));
                                    window.location.reload(); // Simple reload to apply
                                }}
                            />
                        </div>

                        {/* Notifications */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5" />
                                <div>
                                    <h4 className="font-medium">Notifications</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Recevoir des notifications pour les nouveaux cours
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications}
                                onCheckedChange={setNotifications}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Statistiques */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Statistiques d'utilisation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-blue-500">{courses.length}</div>
                                <div className="text-xs text-muted-foreground">Cours disponibles</div>
                            </div>

                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-green-500">
                                    {courses.reduce((acc, c) => acc + (c.quiz?.length || 0), 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">Questions QCM</div>
                            </div>

                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-purple-500">
                                    {courses.reduce((acc, c) => acc + parseInt(c.duration), 0)}h
                                </div>
                                <div className="text-xs text-muted-foreground">Heures de contenu</div>
                            </div>

                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-orange-500">
                                    {courses.reduce((acc, c) => acc + (c.chapters || 0), 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">Chapitres total</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Zone de danger
                        </CardTitle>
                        <CardDescription>
                            Actions irréversibles - Utilisez avec prudence
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            variant="destructive"
                            className="w-full gap-2 justify-start"
                            onClick={() => {
                                if (confirm('Voulez-vous vraiment effacer tous vos favoris et votre progression ?')) {
                                    localStorage.removeItem('favorites');
                                    localStorage.removeItem('completed');
                                    localStorage.removeItem('progress');
                                    localStorage.removeItem('tuto_gamification');
                                    window.location.reload();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Réinitialiser toute la progression (XP inclus)
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full gap-2 justify-start text-red-600 hover:text-red-700"
                            onClick={() => {
                                if (confirm('Voulez-vous vraiment vider tout le cache de l\'application ?')) {
                                    caches.keys().then(names => {
                                        names.forEach(name => caches.delete(name));
                                    });
                                    window.location.reload();
                                }
                            }}
                        >
                            <Database className="h-4 w-4" />
                            Vider le cache de l'application
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
