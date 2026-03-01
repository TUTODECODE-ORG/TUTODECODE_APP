import { Brain, Terminal, ShieldCheck, Database, Lightbulb } from 'lucide-react';


export function PhilosophySection() {
    const points = [
        {
            icon: Lightbulb,
            title: "Au-delà de l'IA",
            description: "L'IA répond à vos questions, mais ne vous dit pas quelles questions poser. TutoDecode structure votre apprentissage pour combler les inconnues.",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20"
        },
        {
            icon: Terminal,
            title: "Apprentissage Actif",
            description: "Regarder un tuto ne suffit pas. Notre terminal intégré vous force à pratiquer. C'est dans la friction que l'apprentissage se consolide.",
            color: "text-indigo-400",
            bg: "bg-indigo-/10",
            border: "border-indigo-/20"
        },
        {
            icon: ShieldCheck,
            title: "Privacy First",
            description: "Votre code, votre progression, vos données. Tout reste local grâce à une architecture révolutionnaire sans serveur (WebContainers & WebGPU).",
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            icon: Database,
            title: "Zéro Hallucination",
            description: "Contrairement aux LLM probabilistes, nos cours sont vérifiés et déterministes. Apprenez des commandes qui existent vraiment.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="container mx-auto px-4 lg:px-6 relative z-10 max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-400 mb-6 backdrop-blur-sm">
                        <Brain className="w-4 h-4" />
                        <span>Notre Philosophie</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                        Pourquoi TutoDecode à l'ère de l'IA ?
                    </h2>

                    <p className="text-lg text-zinc-400 leading-relaxed">
                        L'intelligence artificielle est un outil puissant, mais elle ne remplace pas une structure pédagogique rigoureuse.
                        Nous combinons le meilleur des deux mondes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {points.map((point, index) => {
                        const Icon = point.icon;
                        return (
                            <div
                                key={index}
                                className="group relative p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-300 backdrop-blur-sm"
                            >
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${point.bg} ${point.border} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-7 h-7 ${point.color}`} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                                            {point.title}
                                        </h3>
                                        <p className="text-zinc-400 leading-relaxed text-base">
                                            {point.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
