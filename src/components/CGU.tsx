
import { useSEO } from '@/hooks/useSEO';
import { Users, ArrowLeft, Scale, FileText, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';

interface CGUProps {
    onBack: () => void;
}

export function CGU({ onBack }: CGUProps) {
    useSEO({
        title: "Conditions Générales d'Utilisation",
        description: "Conditions d'utilisation, règles de la communauté et propriété intellectuelle de TutoDecode.",
        keywords: ["cgu", "conditions utilisation", "règles", "droit", "tutodecode"]
    });

    return (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={onBack} className="gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Button>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <h1 className="text-xl font-bold flex items-center gap-2 text-purple-400">
                        <Users className="w-5 h-5" /> CGU
                    </h1>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 pb-20 text-zinc-300">
                    <h2 className="text-3xl font-bold text-white">Conditions Générales d'Utilisation</h2>

                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Scale className="w-5 h-5 text-indigo-400" /> 1. Objet de la plateforme
                        </h3>
                        <p className="text-sm leading-relaxed">
                            TutoDecode est une plateforme technologique d'apprentissage informatique. Les présentes CGU fixent les modalités d'accès au service et les responsabilités de l'utilisateur. L'utilisation du site, même sans compte, implique l'acceptation de ces règles.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" /> 2. Propriété Intellectuelle (Freeware Propriétaire)
                        </h3>
                        <div className="space-y-3 p-5 bg-zinc-950/50 border border-white/5 rounded-xl">
                            <p className="text-sm leading-relaxed font-semibold text-white">
                                TutoDecode n'est pas un projet Open Source.
                            </p>
                            <p className="text-sm leading-relaxed">
                                L'architecture logicielle, les bases de données de cours, les algorithmes du simulateur et l'identité visuelle sont la propriété exclusive de winancher_officiel.
                                Le statut de "Freeware" autorise l'usage gratuit pour l'utilisateur, mais interdit formellement :
                            </p>
                            <ul className="list-disc list-inside text-xs space-y-2 text-zinc-400 ml-4 italic">
                                <li>La redistribution du code source sous quelque forme que ce soit.</li>
                                <li>L'utilisation des cours dans un contexte commercial sans licence explicite.</li>
                                <li>L'extraction automatisée (scraping) du contenu pédagogique.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-400" /> 3. Usage Responsable & Éthique
                        </h3>
                        <Card className="bg-red-500/5 border-red-500/20 p-6">
                            <CardContent className="p-0 text-sm leading-relaxed flex items-start gap-4">
                                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-white mb-2">Avertissement Légal :</p>
                                    TutoDecode forme des experts en cybersécurité. Les techniques de simulation de "Honeypot" ou d'analyse logicielle fournies sont strictement destinées à la défense. L'utilisation de ces connaissances pour nuire à des systèmes tiers est illégale et tombe sous le coup des articles 323-1 et suivants du Code pénal.
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white">4. Absence de Garantie</h3>
                        <p className="text-sm leading-relaxed">
                            Le service est fourni "As-Is". L'infrastructure étant majoritairement cliente, la stabilité dépend du matériel de l'utilisateur (GPU pour l'IA, RAM pour les modules). L'éditeur ne peut être tenu responsable des pertes de données locales.
                        </p>
                    </section>

                    <div className="text-center pt-12 border-t border-white/5">
                        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
                            TutoDecode Compliance Unit • 2026
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
