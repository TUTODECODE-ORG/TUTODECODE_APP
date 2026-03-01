import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ServerErrorPage } from './ErrorPage';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorCount: number;
}

/**
 * Error Boundary amélioré pour capturer les erreurs React
 * Affiche une page d'erreur moderne au lieu de crasher l'application
 * Inclut logging et métriques de performance
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
        };
    }

    static getDerivedStateFromError(_error: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log l'erreur
        console.error('🔴 ErrorBoundary caught an error:', error);
        console.error('📍 Component stack:', errorInfo.componentStack);

        // Incrémenter le compteur d'erreurs
        const errorCount = this.state.errorCount + 1;

        this.setState({
            error,
            errorInfo,
            errorCount,
        });

        // Log dans localStorage pour debugging
        try {
            const errorLog = {
                timestamp: new Date().toISOString(),
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                count: errorCount,
                userAgent: navigator.userAgent,
                url: window.location.href,
            };

            const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            logs.push(errorLog);

            // Garder seulement les 10 dernières erreurs
            if (logs.length > 10) logs.shift();

            localStorage.setItem('error_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to log error to localStorage:', e);
        }

        // Optionnel: Envoyer à un service de monitoring (Sentry, LogRocket, etc.)
        // if (import.meta.env.PROD) {
        //   logErrorToService(error, errorInfo);
        // }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // UI de secours personnalisée
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Utiliser la page d'erreur moderne
            return (
                <ServerErrorPage
                    title="Erreur de l'application"
                    message={
                        (import.meta as any).env.DEV && this.state.error
                            ? this.state.error.message
                            : "Une erreur inattendue s'est produite. L'équipe technique a été notifiée."
                    }
                    onNavigateHome={this.handleReset}
                    onGoBack={this.handleReload}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Export logs d'erreur pour debugging
 */
export function getErrorLogs() {
    try {
        return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
        return [];
    }
}

/**
 * Nettoyer les logs d'erreur
 */
export function clearErrorLogs() {
    localStorage.removeItem('error_logs');
}
