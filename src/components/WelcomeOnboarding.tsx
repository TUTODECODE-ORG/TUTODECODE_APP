import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    BookOpen,
    CheckCircle,
    Star,
    Download,
    Search,
    Filter,
    GraduationCap,
} from 'lucide-react';

interface OnboardingStep {
    title: string;
    description: string;
    icon: React.ElementType;
    content: React.ReactNode;
}

export function WelcomeOnboarding() {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Vérifier si c'est la première visite
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setOpen(false);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const steps: OnboardingStep[] = [
        {
            title: '👋 Bienvenue sur TutoDecode !',
            description: 'Votre plateforme de formation 100% gratuite',
            icon: Sparkles,
            content: (
                <div className="space-y-6 py-4">
                    <div className="text-center space-y-4">
                        <div className="text-6xl mb-4 animate-bounce">🎓</div>
                        <h3 className="text-2xl font-bold gradient-text">
                            Bienvenue, l'Indestructible !
                        </h3>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto">
                            Prêt à maîtriser <strong className="text-white">Linux, Docker, la Sécurité</strong> et bien plus ?
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 bg-indigo-/10 border border-indigo-/20 rounded-xl">
                            <div className="text-2xl mb-2">🚀</div>
                            <div className="font-bold text-indigo-400">100% Gratuit</div>
                            <div className="text-xs text-zinc-400">Apprentissage Interactif</div>
                        </div>
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <div className="text-2xl mb-2">🔒</div>
                            <div className="font-bold text-purple-400">100% Privé</div>
                            <div className="text-xs text-zinc-400">Zéro tracking</div>
                        </div>
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <div className="text-2xl mb-2">📚</div>
                            <div className="font-bold text-green-400">Cours Complets</div>
                            <div className="text-xs text-zinc-400">Quiz & Exercices</div>
                        </div>
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                            <div className="text-2xl mb-2">⚡</div>
                            <div className="font-bold text-orange-400">Hors Ligne</div>
                            <div className="text-xs text-zinc-400">Mode PWA</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: '📖 Comment suivre un cours',
            description: 'Découvrez comment naviguer et apprendre',
            icon: BookOpen,
            content: (
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-indigo-/20 flex items-center justify-center flex-shrink-0">
                                <Search className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white mb-1">1. Recherchez un cours</div>
                                <p className="text-sm text-zinc-400">
                                    Utilisez la barre de recherche ou parcourez les catégories (Linux, Docker, Sécurité...)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white mb-1">2. Cliquez sur une carte</div>
                                <p className="text-sm text-zinc-400">
                                    Ouvrez le cours pour accéder au contenu complet, aux exemples de code et aux exercices
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white mb-1">3. Apprenez à votre rythme</div>
                                <p className="text-sm text-zinc-400">
                                    Votre progression est sauvegardée automatiquement dans votre navigateur
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-indigo-/10 to-purple-500/10 border border-indigo-/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span className="font-bold text-indigo-400 text-sm">Astuce Pro</span>
                        </div>
                        <p className="text-xs text-zinc-300">
                            Utilisez <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs">Ctrl+K</kbd> pour ouvrir rapidement la recherche !
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: '✅ Marquer comme terminé',
            description: 'Suivez votre progression et validez vos acquis',
            icon: CheckCircle,
            content: (
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-white mb-2">Bouton "Terminé"</div>
                                <p className="text-sm text-zinc-400 mb-3">
                                    Cliquez sur l'icône ✓ en haut à droite de chaque carte de cours pour le marquer comme terminé
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                                        Complété
                                    </Badge>
                                    <span className="text-zinc-500">← Apparaît après validation</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white mb-1">Favoris</div>
                                <p className="text-sm text-zinc-400">
                                    Marquez vos cours préférés avec l'étoile ⭐ pour y revenir facilement
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-indigo-/20 flex items-center justify-center flex-shrink-0">
                                <Filter className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white mb-1">Filtrer par statut</div>
                                <p className="text-sm text-zinc-400">
                                    Consultez uniquement vos cours favoris ou terminés via la barre latérale
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                        <div className="text-4xl mb-3">🏆</div>
                        <div className="font-bold text-green-400 mb-1">Votre progression est sauvegardée</div>
                        <p className="text-xs text-zinc-400">
                            Toutes vos données restent dans votre navigateur. Zéro serveur, zéro tracking.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: '⚡ Fonctionnalités avancées',
            description: 'Mode hors ligne, téléchargements et plus encore',
            icon: Download,
            content: (
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <Download className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white mb-1">📥 Mode Hors Ligne</div>
                                <p className="text-sm text-zinc-400">
                                    Téléchargez vos cours pour y accéder sans connexion internet
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-indigo-/20 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white mb-1">🎯 Quiz & Exercices</div>
                                <p className="text-sm text-zinc-400">
                                    Testez vos connaissances avec des quiz interactifs et générez vos certificats
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white mb-1">🔧 Cheatsheets</div>
                                <p className="text-sm text-zinc-400">
                                    Accédez aux aide-mémoires pour retrouver rapidement les commandes essentielles
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-4 pt-6 border-t border-zinc-800">
                        <div className="text-4xl">🚀</div>
                        <h4 className="font-bold text-xl text-white">Prêt à commencer ?</h4>
                        <p className="text-sm text-zinc-400">
                            Explorez les cours et construisez votre expertise dès maintenant !
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    const currentStepData = steps[currentStep];
    const Icon = currentStepData.icon;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-/20 to-purple-500/20 flex items-center justify-center border border-indigo-/30">
                            <Icon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold text-white">
                                {currentStepData.title}
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                {currentStepData.description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-6">
                    {currentStepData.content}
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`h-2 rounded-full transition-all ${index === currentStep
                                ? 'w-8 bg-indigo-'
                                : 'w-2 bg-zinc-700 hover:bg-zinc-600'
                                }`}
                            aria-label={`Aller à l'étape ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-zinc-800">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                    </Button>

                    <span className="text-sm text-zinc-500">
                        {currentStep + 1} / {steps.length}
                    </span>

                    <Button
                        onClick={handleNext}
                        className="gap-2 bg-indigo-500 hover:bg-indigo-500"
                    >
                        {currentStep === steps.length - 1 ? (
                            <>
                                Commencer
                                <Sparkles className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Suivant
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>

                {/* Skip button */}
                <div className="text-center mt-4">
                    <button
                        onClick={handleClose}
                        className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
                    >
                        Passer le tutoriel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
