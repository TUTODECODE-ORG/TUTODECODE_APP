
import { useSEO } from '@/hooks/useSEO';
import { FileText, ArrowLeft, User, Server, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface MentionsLegalesProps {
    onBack: () => void;
}

export function MentionsLegales({ onBack }: MentionsLegalesProps) {
    useSEO({
        title: "Mentions Légales",
        description: "Informations légales, éditeur et hébergeur de la plateforme TutoDecode.",
        keywords: ["mentions légales", "éditeur", "hébergeur", "contact", "tutodecode"]
    });

    return (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={onBack} className="gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Button>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                        <FileText className="w-5 h-5" /> Mentions Légales
                    </h1>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 pb-20">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white mb-2">Mentions Légales</h2>
                        <p className="text-zinc-400 italic text-sm">Conformément aux dispositions de l'Article 6 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN).</p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="bg-zinc-900/40 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm text-indigo-400 uppercase tracking-widest">
                                        <User className="w-4 h-4" /> Édition du site
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-zinc-300 space-y-2">
                                    <p><strong>Propriétaire :</strong> TutoDecode (Représenté par winancher_officiel)</p>
                                    <p><strong>Contact :</strong> contact@tutodecode.org</p>
                                    <p><strong>Directeur de la publication :</strong> winancher_officiel</p>
                                    <p><strong>Statut :</strong> Projet éducatif indépendant</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900/40 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm text-indigo-400 uppercase tracking-widest">
                                        <Server className="w-4 h-4" /> Hébergement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-zinc-300 space-y-2">
                                    <p><strong>Hébergeur :</strong> o2switch</p>
                                    <p>Chem. des Pardiaux, 63000 Clermont-Ferrand, France</p>
                                    <p><strong>Téléphone :</strong> 04 44 44 60 40</p>
                                    <p><strong>Site Web :</strong> www.o2switch.fr</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-zinc-900/40 border-zinc-800 p-6 text-sm text-zinc-400 leading-relaxed">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-emerald-400" /> Nature du projet
                            </h3>
                            Le site <strong>tutodecode.org</strong> est une plateforme de formation interactive fonctionnant comme une Application Web Progressive (PWA). Sa particularité réside dans l'exécution locale des scripts et des modèles d'intelligence artificielle, garantissant une souveraineté numérique totale à l'utilisateur.
                        </Card>
                    </div>

                    <div className="text-center pt-12 border-t border-white/5">
                        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
                            TutoDecode • Dernière révision : 15.02.2026
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
