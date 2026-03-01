/**
 * 🎯 HONEYPOT PLAYGROUND - Zone de Combat SecOps
 * 
 * Environnements VOLONTAIREMENT VULNÉRABLES pour pratiquer
 * les techniques d'exploitation en conditions réelles.
 * 
 * ⚠️ AVERTISSEMENT : Ce code est intentionnellement non sécurisé.
 * NE JAMAIS utiliser ces patterns en production.
 * 
 * @author Winancher - Ghost Protocol Team
 */

import { useState } from 'react';
import { ArrowLeft, Shield, AlertTriangle, Lock, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SQLInjectionLab } from '@/components/SQLInjectionLab';

interface HoneypotPlaygroundProps {
    onBack: () => void;
}

const HONEYPOT_CHALLENGES = [
    {
        id: 'sql-injection',
        title: 'SQL Injection',
        difficulty: 'Débutant',
        description: 'Bypass d\'authentification via injection SQL',
        icon: AlertTriangle,
        color: 'orange',
        status: 'available',
        component: SQLInjectionLab
    },
    {
        id: 'xss-challenge',
        title: 'Cross-Site Scripting (XSS)',
        difficulty: 'Intermédiaire',
        description: 'Injection de scripts malveillants dans une page web',
        icon: Target,
        color: 'red',
        status: 'coming-soon',
        component: null
    },
    {
        id: 'csrf-challenge',
        title: 'CSRF Attack',
        difficulty: 'Intermédiaire',
        description: 'Forcer un utilisateur authentifié à exécuter des actions',
        icon: Shield,
        color: 'purple',
        status: 'coming-soon',
        component: null
    },
    {
        id: 'path-traversal',
        title: 'Path Traversal',
        difficulty: 'Débutant',
        description: 'Accéder à des fichiers en dehors du répertoire autorisé',
        icon: Lock,
        color: 'blue',
        status: 'coming-soon',
        component: null
    },
    {
        id: 'command-injection',
        title: 'Command Injection',
        difficulty: 'Avancé',
        description: 'Exécuter des commandes système arbitraires',
        icon: Zap,
        color: 'yellow',
        status: 'coming-soon',
        component: null
    }
];

const DIFFICULTY_COLORS = {
    'Débutant': 'text-green-400 border-green-500/30 bg-green-500/10',
    'Intermédiaire': 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    'Avancé': 'text-red-400 border-red-500/30 bg-red-500/10'
};

export function HoneypotPlayground({ onBack }: HoneypotPlaygroundProps) {
    const [selectedChallenge, setSelectedChallenge] = useState<typeof HONEYPOT_CHALLENGES[0] | null>(null);

    const renderChallengeList = () => (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600">
                    <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">
                        Honeypot Playground
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Environnements volontairement vulnérables pour apprendre les techniques d'exploitation.
                        <br />
                        <strong className="text-orange-400">100% légal • 100% éducatif • 0% production</strong>
                    </p>
                </div>
            </div>

            {/* Warning Banner */}
            <Alert className="bg-red-500/10 border-red-500/30 max-w-4xl mx-auto">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <AlertDescription className="text-slate-200">
                    <strong>⚠️ AVERTISSEMENT IMPORTANT :</strong> Ces environnements sont INTENTIONNELLEMENT vulnérables
                    à des fins éducatives. Le code présenté ici ne doit JAMAIS être utilisé en production.
                    L'objectif est d'apprendre à détecter et corriger ces vulnérabilités.
                </AlertDescription>
            </Alert>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Card className="bg-slate-900/50 border-green-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">
                            {HONEYPOT_CHALLENGES.filter(c => c.status === 'available').length}
                        </div>
                        <div className="text-sm text-slate-400">Challenges Disponibles</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-orange-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-orange-400 mb-1">
                            {HONEYPOT_CHALLENGES.filter(c => c.status === 'coming-soon').length}
                        </div>
                        <div className="text-sm text-slate-400">Bientôt Disponibles</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-blue-500/30">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">100%</div>
                        <div className="text-sm text-slate-400">Sandbox Isolé</div>
                    </CardContent>
                </Card>
            </div>

            {/* Challenges Grid */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Sélectionnez votre Challenge</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HONEYPOT_CHALLENGES.map((challenge) => {
                        const Icon = challenge.icon;
                        const isAvailable = challenge.status === 'available';

                        return (
                            <Card
                                key={challenge.id}
                                className={`relative overflow-hidden transition-all cursor-pointer ${isAvailable
                                        ? `bg-slate-900/50 border-${challenge.color}-500/30 hover:border-${challenge.color}-500 hover:bg-slate-800/50`
                                        : 'bg-slate-900/30 border-slate-700 opacity-60'
                                    }`}
                                onClick={() => isAvailable && setSelectedChallenge(challenge)}
                            >
                                {!isAvailable && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full font-semibold">
                                            Bientôt
                                        </div>
                                    </div>
                                )}

                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg bg-${challenge.color}-500/20 flex items-center justify-center mb-3`}>
                                        <Icon className={`w-6 h-6 text-${challenge.color}-400`} />
                                    </div>
                                    <CardTitle className="text-white text-lg">{challenge.title}</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        {challenge.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${DIFFICULTY_COLORS[challenge.difficulty as keyof typeof DIFFICULTY_COLORS]
                                        }`}>
                                        {challenge.difficulty}
                                    </div>

                                    {isAvailable && (
                                        <div className="mt-4">
                                            <Button
                                                className={`w-full bg-${challenge.color}-600 hover:bg-${challenge.color}-700 text-white`}
                                            >
                                                Lancer le Challenge
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Educational Note */}
            <Card className="max-w-4xl mx-auto bg-slate-900/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-slate-200 text-lg">📚 Objectifs Pédagogiques</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-400 space-y-3">
                    <p>
                        <strong className="text-white">Comprendre les vulnérabilités :</strong> En exploitant ces failles,
                        vous comprendrez leur fonctionnement et leur impact réel.
                    </p>
                    <p>
                        <strong className="text-white">Apprendre la défense :</strong> Chaque challenge inclut les bonnes
                        pratiques pour se protéger de ce type d'attaque.
                    </p>
                    <p>
                        <strong className="text-white">Pratique sécurisée :</strong> Tout est isolé dans votre navigateur.
                        Aucune donnée réelle n'est compromise.
                    </p>
                    <p className="text-orange-400 font-semibold pt-2">
                        ⚡ Rappel : Ces techniques sont enseignées à des fins défensives uniquement.
                        Toute utilisation malveillante est illégale et contraire à l'éthique du hacking éthique.
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    const renderChallenge = () => {
        if (!selectedChallenge || !selectedChallenge.component) return null;

        const Component = selectedChallenge.component;

        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => setSelectedChallenge(null)}
                    className="text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux Challenges
                </Button>

                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-${selectedChallenge.color}-500/20 flex items-center justify-center`}>
                        <selectedChallenge.icon className={`w-8 h-8 text-${selectedChallenge.color}-400`} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{selectedChallenge.title}</h1>
                        <p className="text-slate-400">{selectedChallenge.description}</p>
                    </div>
                </div>

                <Component />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0B1221] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                {/* Back Button (only on main view) */}
                {!selectedChallenge && (
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="mb-6 text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à l'accueil
                    </Button>
                )}

                {selectedChallenge ? renderChallenge() : renderChallengeList()}
            </div>
        </div>
    );
}
