import { Home, ArrowLeft, Search, AlertTriangle, ServerCrash, ShieldAlert, Lock, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

type ErrorType = '404' | '500' | '403' | '401' | 'offline' | 'generic';

interface ErrorPageProps {
    type?: ErrorType;
    title?: string;
    message?: string;
    onNavigateHome?: () => void;
    onGoBack?: () => void;
    showRefresh?: boolean;
}

const ERROR_CONFIGS = {
    '404': {
        title: 'Page introuvable',
        message: 'Désolé, la page que vous recherchez n\'existe pas ou a été déplacée.',
        icon: Search,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        suggestion: 'Vérifiez l\'URL ou retournez à l\'accueil pour découvrir nos cours.',
    },
    '500': {
        title: 'Erreur serveur',
        message: 'Une erreur interne s\'est produite. Nos équipes ont été notifiées.',
        icon: ServerCrash,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        suggestion: 'Veuillez réessayer dans quelques instants ou contacter le support si le problème persiste.',
    },
    '403': {
        title: 'Accès interdit',
        message: 'Vous n\'avez pas l\'autorisation d\'accéder à cette ressource.',
        icon: ShieldAlert,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        suggestion: 'Si vous pensez avoir besoin d\'accès, contactez votre administrateur.',
    },
    '401': {
        title: 'Non autorisé',
        message: 'Vous devez être connecté pour accéder à cette page.',
        icon: Lock,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        suggestion: 'Connectez-vous avec votre compte pour continuer.',
    },
    'offline': {
        title: 'Hors ligne',
        message: 'Aucune connexion Internet détectée.',
        icon: Wifi,
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        suggestion: 'Vérifiez votre connexion et réessayez. Certains contenus peuvent être disponibles hors ligne.',
    },
    'generic': {
        title: 'Une erreur est survenue',
        message: 'Quelque chose s\'est mal passé de notre côté.',
        icon: AlertTriangle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        suggestion: 'Essayez de recharger la page ou revenez plus tard.',
    },
};

/**
 * Composant de page d'erreur moderne et personnalisable
 * S'adapte à différents types d'erreurs avec des visuels cohérents
 */
export function ErrorPage({
    type = 'generic',
    title,
    message,
    onNavigateHome,
    onGoBack,
    showRefresh = true,
}: ErrorPageProps) {
    const config = ERROR_CONFIGS[type];
    const Icon = config.icon;

    const handleNavigateHome = () => {
        if (onNavigateHome) {
            onNavigateHome();
        } else {
            window.location.href = '/';
        }
    };

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
        } else {
            window.history.back();
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <Card className="relative max-w-2xl w-full overflow-hidden">
                {/* Gradient header decoration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <CardContent className="p-8 md:p-12 space-y-8">
                    {/* Icon and Error Code */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`relative p-6 rounded-full ${config.bgColor} animate-bounce-slow`}>
                            <Icon className={`h-16 w-16 ${config.color}`} />

                            {/* Pulse effect */}
                            <div className={`absolute inset-0 rounded-full ${config.bgColor} animate-ping opacity-20`} />
                        </div>

                        {type !== 'generic' && (
                            <div className={`text-8xl font-black ${config.color} opacity-10 absolute top-8 right-8 select-none pointer-events-none`}>
                                {type}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {title || config.title}
                        </h1>

                        <p className="text-lg text-muted-foreground">
                            {message || config.message}
                        </p>

                        <div className="pt-4">
                            <Card className="bg-muted/50 border-muted">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground italic">
                                        💡 {config.suggestion}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            onClick={handleNavigateHome}
                            className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            size="lg"
                        >
                            <Home className="h-5 w-5" />
                            Retour à l'accueil
                        </Button>

                        <Button
                            onClick={handleGoBack}
                            variant="outline"
                            className="flex-1 gap-2"
                            size="lg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Page précédente
                        </Button>
                    </div>

                    {showRefresh && (
                        <div className="text-center">
                            <Button
                                onClick={handleRefresh}
                                variant="ghost"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Ou essayez de recharger la page
                            </Button>
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="border-t pt-6 mt-6">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Le problème persiste ?
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button variant="link" size="sm" className="text-primary">
                                    Contacter le support
                                </Button>
                                <span className="text-muted-foreground">•</span>
                                <Button variant="link" size="sm" className="text-primary">
                                    Signaler un bug
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
        </div>
    );
}

// Composants raccourcis pour chaque type d'erreur
export const NotFoundPage = (props: Omit<ErrorPageProps, 'type'>) => (
    <ErrorPage {...props} type="404" />
);

export const ServerErrorPage = (props: Omit<ErrorPageProps, 'type'>) => (
    <ErrorPage {...props} type="500" />
);

export const ForbiddenPage = (props: Omit<ErrorPageProps, 'type'>) => (
    <ErrorPage {...props} type="403" />
);

export const UnauthorizedPage = (props: Omit<ErrorPageProps, 'type'>) => (
    <ErrorPage {...props} type="401" />
);

export const OfflinePage = (props: Omit<ErrorPageProps, 'type'>) => (
    <ErrorPage {...props} type="offline" />
);
