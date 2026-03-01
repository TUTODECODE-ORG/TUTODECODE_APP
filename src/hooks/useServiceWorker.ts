import { useEffect, useState } from 'react';

interface ServiceWorkerState {
    isSupported: boolean;
    isRegistered: boolean;
    isOnline: boolean;
    updateAvailable: boolean;
    registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
    const [state, setState] = useState<ServiceWorkerState>({
        isSupported: 'serviceWorker' in navigator,
        isRegistered: false,
        isOnline: navigator.onLine,
        updateAvailable: false,
        registration: null,
    });

    useEffect(() => {
        if (!state.isSupported) return;

        let isMounted = true;

        const initServiceWorker = async () => {
            if ((import.meta as any).env.DEV) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
                return;
            }

            // PROD Mode
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });
                if (!isMounted) return;

                console.log('Service Worker enregistré avec succès:', registration.scope);

                setState((prev) => ({
                    ...prev,
                    isRegistered: true,
                    registration,
                }));

                // Update checks
                setInterval(() => registration.update().catch(e => console.error("Une erreur s'est produite (Update Loop):", e)), 60 * 60 * 1000); // 1h
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('Nouvelle version disponible');
                                setState(prev => ({ ...prev, updateAvailable: true }));
                            }
                        });
                    }
                });

                registration.update().catch(e => console.error("Une erreur s'est produite (Initial Update):", e));
            } catch (error) {
                console.error("Une erreur s'est produite lors de l'enregistrement du SW:", error);
            }
        };

        initServiceWorker();

        // Listeners for online/offline/messages
        const handleOnline = () => {
            setState(prev => ({ ...prev, isOnline: true }));
            navigator.serviceWorker.ready.then(reg => reg.update());
        };
        const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'UPDATE_AVAILABLE') {
                setState(prev => ({ ...prev, updateAvailable: true }));
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        navigator.serviceWorker.addEventListener('message', handleMessage);

        return () => {
            isMounted = false;
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            navigator.serviceWorker.removeEventListener('message', handleMessage);
        };
    }, [state.isSupported]);

    // Fonction pour forcer la mise à jour
    const updateServiceWorker = () => {
        if (state.registration?.waiting) {
            state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    };

    // Fonction pour mettre en cache des URLs spécifiques
    const cacheUrls = (urls: string[]) => {
        if (state.registration?.active) {
            state.registration.active.postMessage({
                type: 'CACHE_URLS',
                urls,
            });
        }
    };

    // Fonction pour vider le cache
    const clearCache = () => {
        if (state.registration?.active) {
            state.registration.active.postMessage({ type: 'CLEAR_CACHE' });
        }
    };

    // Fonction pour demander la permission des notifications
    const requestNotificationPermission = async (): Promise<boolean> => {
        if (!('Notification' in window)) {
            console.warn('Les notifications ne sont pas supportées');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    };

    // Fonction pour envoyer une notification
    const sendNotification = async (title: string, options?: NotificationOptions) => {
        const hasPermission = await requestNotificationPermission();

        if (hasPermission && state.registration) {
            await state.registration.showNotification(title, {
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                ...options,
            });
        }
    };

    // Fonction pour enregistrer une synchronisation en arrière-plan
    const registerBackgroundSync = async (tag: string) => {
        if ('sync' in state.registration!) {
            try {
                await (state.registration as any).sync.register(tag);
                console.log('Synchronisation en arrière-plan enregistrée:', tag);
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement de la synchronisation:', error);
            }
        }
    };

    return {
        ...state,
        updateServiceWorker,
        cacheUrls,
        clearCache,
        requestNotificationPermission,
        sendNotification,
        registerBackgroundSync,
    };
}
