import { Server, Shield, Database, Users, Building2, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { AdminBroadcastControl } from './AdminBroadcastControl';
import { AppSection } from './AppSection';

export function EnterprisePage() {
    const { isAdmin } = useAuth();

    return (
        <div className="min-h-screen bg-[#0B1221] text-white">
            {/* Admin Console Section (Visible only to admins) */}
            {isAdmin && (
                <div className="container mx-auto px-4 py-12 border-b border-indigo-/20 bg-indigo-/5">
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-/20 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Panneau d'administration</h2>
                                <p className="text-zinc-400 text-sm">Gestion des communications en temps réel</p>
                            </div>
                        </div>
                        <AdminBroadcastControl />
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-zinc-800">
                <div className="absolute inset-0 bg-grid-zinc-800/20 [mask-image:linear-gradient(0deg,transparent,black)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-/10 via-transparent to-indigo-/10" />

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <Badge variant="outline" className="border-indigo-/50 text-indigo-400 px-4 py-1 mb-4 animate-pulse">
                            TUTODECODE FOR BUSINESS
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo- via-indigo- to-white">
                            Formez votre Élite Cyber
                            <br />
                            <span className="text-white">En Circuit Fermé.</span>
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            La plateforme d'entraînement pour les équipes qui ne peuvent pas se permettre de fuites de données.
                            <br />
                            <span className="text-indigo-400 font-semibold">100% Local. 100% Souverain. 100% Hardcore.</span>
                        </p>

                        <div className="flex justify-center pt-8">
                            <div className="flex flex-col gap-2 w-full md:w-auto p-4 items-center">
                                <a href="/downloads/TutoDeCode-Setup.msi" download className="w-full md:w-auto">
                                    <Button size="lg" className="bg-indigo-500 hover:bg-indigo-500 text-white px-8 h-14 text-lg shadow-lg shadow-indigo-/20 w-64 mb-2 md:mb-0">
                                        <Server className="mr-2 h-5 w-5" />
                                        Télécharger .msi
                                    </Button>
                                </a>
                                <span className="text-xs text-zinc-500 block">Installation locale Windows via package MSI officiel</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Value Props Grid */}
            <div className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-indigo-/50 transition-all duration-300 group">
                        <CardContent className="p-8 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Server className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Déploiement Air-Gapped</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Installez TutoDecode directement sur vos serveurs internes ou laptops sécurisés.
                                Aucune connexion internet requise. Vos données ne sortent jamais.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-indigo-/50 transition-all duration-300 group">
                        <CardContent className="p-8 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">IA Locale & Privée</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Notre IA d'assistance tourne localement (WebLLM/Ollama).
                                Vos ingénieurs peuvent poser des questions sur votre code propriétaire sans risque de fuite vers OpenAI.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-all duration-300 group">
                        <CardContent className="p-8 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Database className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Scénarios "War Games"</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Accédez à notre marketplace de scénarios catastrophe : Ransomware sur Kubernetes,
                                Fuite SQL critique, Audit Post-Mortem. Entraînez vos équipes au pire.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Included Apps/Tools Section */}
            <div className="relative z-10 bg-[#0B1221]">
                <AppSection />
            </div>

            {/* Feature Comparison */}
            <div className="bg-zinc-900/30 border-y border-zinc-800 py-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Pourquoi les OIV nous choisissent</h2>
                        <p className="text-zinc-400">Comparé aux plateformes "Grand Public"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-zinc-500 border-b border-zinc-800 pb-4">
                                Plateformes Classiques
                            </h3>
                            <ul className="space-y-4 text-zinc-400">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">✕</div>
                                    Requiert Internet constant
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">✕</div>
                                    Données envoyées au cloud US
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">✕</div>
                                    Exercices génériques & simples
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-indigo-400 border-b border-indigo-/30 pb-4">
                                TutoDecode Enterprise
                            </h3>
                            <ul className="space-y-4 text-white">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    100% Offline / Air-Gapped Ready
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    Zéro Télémétrie Sortante
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    Scénarios Custom & Hardcore
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trusted By (Mock) */}
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-8">
                    Confiance Technique
                </p>
                <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Mock Logos - Replace with real SVGs or Text */}
                    <div className="flex items-center gap-2 font-bold text-2xl text-white"><Building2 /> CORP_SEC</div>
                    <div className="flex items-center gap-2 font-bold text-2xl text-white"><Shield /> DEFENSE_LTD</div>
                    <div className="flex items-center gap-2 font-bold text-2xl text-white"><Server /> DATA_SOV</div>
                </div>
            </div>

            {/* CTA Footer */}
            <div className="container mx-auto px-4 pb-20">
                <div className="bg-gradient-to-r from-indigo-/50 to-zinc-900 rounded-2xl p-12 text-center border border-indigo-/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="w-64 h-64" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
                        Prêt à équiper votre équipe ?
                    </h2>
                    <p className="text-indigo-/80 mb-8 max-w-2xl mx-auto relative z-10">
                        Obtenez une licence perpétuelle pour votre infrastructure.
                        Mises à jour via clé USB sécurisée ou dépôt privé.
                    </p>
                    <div className="flex justify-center gap-4 relative z-10">
                        <Button className="bg-white text-indigo-400 hover:bg-zinc-200 font-bold px-8 py-6 rounded-xl">
                            Contacter les Ventes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
