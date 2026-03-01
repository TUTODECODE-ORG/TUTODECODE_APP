
import { useSEO } from '@/hooks/useSEO';
import { Shield, ArrowLeft, Lock, Eye, Database, Info, FileCheck } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
    useSEO({
        title: "Politique de Confidentialité",
        description: "Engagement de TutoDecode sur la protection de vos données et le respect du RGPD.",
        keywords: ["confidentialité", "rgpd", "données personnelles", "protection", "tutodecode"]
    });

    return (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={onBack} className="gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Button>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <h1 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                        <Shield className="w-5 h-5" /> Confidentialité (RGPD)
                    </h1>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 pb-20">
                    <h2 className="text-3xl font-bold text-white mb-2 underline decoration-emerald-500/50 underline-offset-8">Politique de Confidentialité</h2>

                    <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-2xl">
                        <CardContent className="p-8">
                            <div className="flex items-start gap-6">
                                <Lock className="w-12 h-12 text-emerald-500 shrink-0" />
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white">Stockage Local de Données (SLD)</h3>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-mono bg-black/40 p-4 rounded-lg border border-white/5">
                                        "La vie privée par défaut n'est pas une option, c'est notre fondation technique."
                                    </p>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        TutoDecode utilise la technologie <strong>Client-Side Storage</strong>. Cela signifie que 100% de votre progression, vos succès, et vos préférences sont injectés dans la mémoire de votre navigateur (LocalStorage) et non sur nos serveurs.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-white font-bold">
                                <Eye className="w-5 h-5 text-indigo-400" /> Transparence totale
                            </h4>
                            <p className="text-sm text-zinc-400">
                                Nous ne collectons aucune donnée nominative. Pas d'adresse e-mail, pas de mot de passe, pas de numéro de téléphone. Votre session est anonyme par nature.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-white font-bold">
                                <Database className="w-5 h-5 text-purple-400" /> Vos Droits (RGPD)
                            </h4>
                            <p className="text-sm text-zinc-400">
                                En tant que propriétaire souverain de vos données locales, vous pouvez exercer vos droits (Accès, Rectification, Suppression) directement depuis l'onglet <strong>Paramètres</strong> de l'application.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-emerald-400" /> Mesures de Sécurité
                        </h4>
                        <div className="grid gap-4">
                            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-lg flex items-center gap-4">
                                <div className="p-2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">PWA</div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Communication sécurisée via protocole HTTPS uniquement.</p>
                            </div>
                            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-lg flex items-center gap-4">
                                <div className="p-2 rounded bg-indigo-/20 text-indigo-400 font-bold text-xs">SHA</div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">Vérification d'intégrité des fichiers de backup (.tuto).</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex items-center gap-3">
                        <Info className="w-5 h-5 text-zinc-500 shrink-0" />
                        <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest leading-relaxed">
                            Compliant with EU General Data Protection Regulation (GDPR) - Article 25 (Privacy by Design)
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
