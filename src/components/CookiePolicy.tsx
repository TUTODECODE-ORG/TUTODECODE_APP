
import { useSEO } from '@/hooks/useSEO';
import { Cookie, ArrowLeft, ShieldCheck, XCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface CookiePolicyProps {
    onBack: () => void;
}

export function CookiePolicy({ onBack }: CookiePolicyProps) {
    useSEO({
        title: "Politique de Cookies",
        description: "Information sur l'absence de cookies tiers et de traçage sur TutoDecode.",
        keywords: ["cookies", "tracking", "vie privée", "localstorage", "tutodecode"]
    });

    return (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={onBack} className="gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Button>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <h1 className="text-xl font-bold flex items-center gap-2 text-amber-500">
                        <Cookie className="w-5 h-5" /> Politique de Cookies
                    </h1>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12 pb-20">
                    <div className="text-center space-y-6 py-10">
                        <div className="inline-flex items-center justify-center p-6 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                            <Cookie className="w-20 h-20 text-amber-500 animate-pulse-slow" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-white">Zéro Cookie. Zéro Tracking.</h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto italic">
                            "Le meilleur moyen de protéger vos données de navigation est de ne pas les collecter."
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4 hover:border-emerald-500/30 transition-all group">
                            <ShieldCheck className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-white">Pas de Cookies Tiers</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                TutoDecode n'héberge aucun script externe (Google Analytics, Facebook Pixel, LinkedIn Insight, etc.). Votre navigation reste strictement privée entre vous et notre interface.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4 hover:border-red-500/30 transition-all group">
                            <XCircle className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-white">Pas de Cookies de Profilage</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Nous n'utilisons aucun cookie de session ou de préférence. Toutes vos données d'état sont gérées via les APIs de stockage local sécurisées du navigateur (LocalStorage).
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl flex items-start gap-4">
                        <Info className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <h4 className="font-bold text-white text-sm uppercase tracking-widest">Note Technique</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                L'utilisation du Stockage Local (LocalStorage/IndexedDB) est nécessaire au fonctionnement technique de l'application (sauvegarde de la progression). Contrairement aux cookies, ces données ne sont jamais envoyées automatiquement au serveur lors des requêtes HTTP.
                            </p>
                        </div>
                    </div>

                    <div className="text-center pt-8 border-t border-white/5">
                        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-mono">
                            Status: Cookie-Free Environment • Approved by Privacy-Devs
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
