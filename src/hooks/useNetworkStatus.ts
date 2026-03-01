import { useState, useEffect } from 'react';

interface NetworkStatus {
    isOnline: boolean;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
}

/**
 * Hook pour détecter le statut de connexion réseau
 * Utilise l'API Network Information quand disponible
 */
export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>({
        isOnline: navigator.onLine,
    });

    useEffect(() => {
        const updateNetworkStatus = () => {
            const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

            setStatus({
                isOnline: navigator.onLine,
                effectiveType: connection?.effectiveType,
                downlink: connection?.downlink,
                rtt: connection?.rtt,
                saveData: connection?.saveData,
            });
        };

        // Event listeners
        const handleOnline = () => {
            updateNetworkStatus();
            console.log('🟢 Connection restored');
        };

        const handleOffline = () => {
            setStatus(prev => ({ ...prev, isOnline: false }));
            console.log('🔴 Connection lost');
        };

        const handleConnectionChange = () => {
            updateNetworkStatus();
        };

        // Initial update
        updateNetworkStatus();

        // Add listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection) {
            connection.addEventListener('change', handleConnectionChange);
        }

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (connection) {
                connection.removeEventListener('change', handleConnectionChange);
            }
        };
    }, []);

    return status;
}

/**
 * Hook pour détecter les erreurs globales de l'application
 */
export function useErrorHandler() {
    const [error, setError] = useState<{ type: string; message: string } | null>(null);

    useEffect(() => {
        // Gérer les erreurs non capturées
        const handleError = (event: ErrorEvent) => {
            console.error('Uncaught error:', event.error);
            setError({
                type: 'runtime',
                message: event.message || 'An unexpected error occurred',
            });

            // Empêche le comportement par défaut (affichage console)
            // event.preventDefault();
        };

        // Gérer les promesses rejetées
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('Unhandled rejection:', event.reason);
            setError({
                type: 'promise',
                message: event.reason?.message || 'A promise was rejected',
            });
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    const clearError = () => setError(null);

    return { error, clearError };
}
