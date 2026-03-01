import { useEffect, useState } from 'react';
import { WifiOff, Wifi, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

export function NetworkAlert() {
    const { isOnline } = useNetworkStatus();
    const [show, setShow] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShow(true);
            setWasOffline(true);
        } else if (wasOffline) {
            // Si on revient en ligne après avoir été hors ligne
            setShow(true);
            // Cache automatiquement après 5 secondes
            const timer = setTimeout(() => setShow(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    if (!show) return null;

    return (
        <div
            className={cn(
                'fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4',
                'transform transition-all duration-300 ease-out',
                show ? 'translate-y-4 opacity-100' : '-translate-y-full opacity-0'
            )}
        >
            <div
                className={cn(
                    'rounded-lg shadow-lg border-2 p-4 flex items-center gap-3',
                    isOnline
                        ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400'
                        : 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400'
                )}
            >
                {isOnline ? (
                    <Wifi className="h-5 w-5 shrink-0" />
                ) : (
                    <WifiOff className="h-5 w-5 shrink-0 animate-pulse" />
                )}

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                        {isOnline ? 'Connexion rétablie' : 'Hors ligne'}
                    </p>
                    <p className="text-xs opacity-90">
                        {isOnline
                            ? 'Vous êtes de nouveau connecté à Internet'
                            : 'Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.'}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0"
                    onClick={() => setShow(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

/**
 * Indicateur de connexion permanente dans le header
 */
export function NetworkIndicator() {
    const { isOnline } = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <WifiOff className="h-3 w-3 text-red-500 animate-pulse" />
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                Hors ligne
            </span>
        </div>
    );
}

/**
 * Bannière globale d'erreur système
 */
interface ErrorBannerProps {
    error: { type: string; message: string } | null;
    onDismiss: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
    if (!error) return null;

    return (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg p-4 flex items-start gap-3 shadow-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                        Une erreur s'est produite
                    </p>
                    <p className="text-sm text-yellow-600/90 dark:text-yellow-400/90 mt-1">
                        {error.message}
                    </p>
                    <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-2">
                        Type: {error.type}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0"
                    onClick={onDismiss}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
