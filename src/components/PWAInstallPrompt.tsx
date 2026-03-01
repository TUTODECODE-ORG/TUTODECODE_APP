import { useState, useEffect } from 'react';
import { Download, X, Wifi, WifiOff, Bell, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showReconnectMessage, setShowReconnectMessage] = useState(false);


    useEffect(() => {
        // Détecte si l'app est déjà installée
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            console.log('✅ Application déjà installée - Pas de popup');
            return; // Ne montre jamais le popup si déjà installé
        }

        // Vérifie si l'utilisateur a déjà refusé l'installation
        const installDismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedDate = localStorage.getItem('pwa-install-dismissed-date');

        if (installDismissed === 'true' && dismissedDate) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);

            // Ne redemande qu'après 30 jours
            if (daysSinceDismissed < 30) {
                console.log(`⏳ Installation refusée il y a ${Math.floor(daysSinceDismissed)} jours - Pas de popup`);
                return;
            } else {
                console.log('🔄 30 jours écoulés - Nouvelle chance d\'installer');
                localStorage.removeItem('pwa-install-dismissed');
                localStorage.removeItem('pwa-install-dismissed-date');
            }
        }

        // Écoute l'événement beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Affiche le prompt après 30 secondes SEULEMENT si :
            // 1. Pas déjà installé
            // 2. Pas déjà refusé récemment
            setTimeout(() => {
                const stillDismissed = localStorage.getItem('pwa-install-dismissed');
                if (!isInstalled && stillDismissed !== 'true') {
                    console.log('📱 Affichage du prompt d\'installation');
                    setShowInstallPrompt(true);
                }
            }, 30000); // 30 secondes
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Détecte les changements de connexion
        const handleOnline = () => {
            console.log('🌐 Reconnexion détectée dans le composant');
            setIsOnline(true);
            setShowReconnectMessage(true);

            // Cache le message après 5 secondes
            setTimeout(() => {
                setShowReconnectMessage(false);
            }, 5000);
        };

        const handleOffline = () => {
            console.log('📡 Déconnexion détectée dans le composant');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Vérifie l'état des notifications
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }

        // Écoute les mises à jour du Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Nouveau Service Worker actif');
                setUpdateAvailable(true);
            });

            // Écoute les messages du Service Worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                    console.log('🆕 Message de mise à jour reçu');
                    setUpdateAvailable(true);
                }
            });
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isInstalled]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ PWA installée avec succès');
            setIsInstalled(true);
            // Supprime les flags de refus si l'utilisateur installe finalement
            localStorage.removeItem('pwa-install-dismissed');
            localStorage.removeItem('pwa-install-dismissed-date');
        } else {
            console.log('❌ Installation refusée par l\'utilisateur');
            // Sauvegarde le refus
            handleDismissInstall();
        }

        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismissInstall = () => {
        console.log('⏭️ Utilisateur a cliqué sur "Plus tard"');

        // Sauvegarde le refus en localStorage
        localStorage.setItem('pwa-install-dismissed', 'true');
        localStorage.setItem('pwa-install-dismissed-date', Date.now().toString());

        setShowInstallPrompt(false);
        setDeferredPrompt(null);

        console.log('💾 Choix sauvegardé - Ne redemandera pas avant 30 jours');
    };

    const handleEnableNotifications = async () => {
        if (!('Notification' in window)) {
            alert('Les notifications ne sont pas supportées par votre navigateur');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');

            if (permission === 'granted') {
                // Enregistre pour les notifications push
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;

                    // Affiche une notification de test
                    registration.showNotification('Ghost Framework', {
                        body: 'Notifications activées ! Vous serez alerté des nouveaux cours.',
                        icon: '/icon-192.png',
                        badge: '/icon-192.png',
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'activation des notifications:', error);
        }
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <>
            {/* Bannière de statut de connexion */}
            {!isOnline && (
                <div className="fixed top-16 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur text-white px-4 py-2 text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                        <WifiOff className="h-4 w-4" />
                        <span>Mode hors ligne - Vos cours restent accessibles</span>
                    </div>
                </div>
            )}

            {/* Bannière de reconnexion */}
            {showReconnectMessage && isOnline && (
                <div className="fixed top-16 left-0 right-0 z-50 bg-green-500/90 backdrop-blur text-white px-4 py-2 text-center text-sm font-medium animate-in slide-in-from-top-5">
                    <div className="flex items-center justify-center gap-2">
                        <Wifi className="h-4 w-4 animate-pulse" />
                        <span>Connexion rétablie - Vérification des mises à jour en cours...</span>
                    </div>
                </div>
            )}

            {/* Notification de mise à jour disponible - Uniquement en PROD */}
            {updateAvailable && !(import.meta as any).env.DEV && (
                <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
                    <Card className="p-4 bg-blue-500/90 backdrop-blur border-blue-400 text-white shadow-lg">
                        <div className="flex items-start gap-3">
                            <RefreshCw className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">Mise à jour disponible</h3>
                                <p className="text-sm text-blue-100 mb-3">
                                    Une nouvelle version de Ghost Framework est prête
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleReload}
                                        className="bg-white text-blue-600 hover:bg-blue-50"
                                    >
                                        Mettre à jour
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setUpdateAvailable(false)}
                                        className="text-white hover:bg-blue-600"
                                    >
                                        Plus tard
                                    </Button>
                                </div>
                            </div>
                            <button
                                onClick={() => setUpdateAvailable(false)}
                                className="text-white/80 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Prompt d'installation PWA */}
            {showInstallPrompt && !isInstalled && deferredPrompt && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl border-0">
                        <button
                            onClick={handleDismissInstall}
                            className="absolute top-3 right-3 text-white/80 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                                <Download className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-1">Installer Ghost Framework</h3>
                                <p className="text-sm text-blue-100">
                                    Accédez à vos cours instantanément, même hors ligne
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                <span>Mode Hors Ligne - Consultez vos cours sans connexion</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                <span>Ultra Rapide - Chargement instantané des pages</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                <span>Notifications - Soyez alerté des nouveaux cours</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                <span>Sécurisé - Vos données sont protégées</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleInstallClick}
                                className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Installer
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleDismissInstall}
                                className="text-white hover:bg-white/20"
                            >
                                Plus tard
                            </Button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/20">
                            <div className="flex items-center justify-between text-xs text-blue-100">
                                <span>Installation légère</span>
                                <span>Moins de 1 MB</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Boutons d'action flottants (quand installé) */}
            {isInstalled && (
                <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
                    {/* Statut de connexion */}
                    <div className="flex justify-end">
                        <Badge
                            variant={isOnline ? 'default' : 'secondary'}
                            className={`
                ${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}
                text-white gap-1.5 px-3 py-1.5
              `}
                        >
                            {isOnline ? (
                                <>
                                    <Wifi className="h-3 w-3" />
                                    <span className="text-xs">En ligne</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-3 w-3" />
                                    <span className="text-xs">Hors ligne</span>
                                </>
                            )}
                        </Badge>
                    </div>

                    {/* Bouton notifications */}
                    {!notificationsEnabled && (
                        <Button
                            size="sm"
                            onClick={handleEnableNotifications}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg gap-2"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="text-xs">Activer les notifications</span>
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}
