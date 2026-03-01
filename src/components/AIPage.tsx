import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Shield, WifiOff, Terminal, Send, ArrowLeft, Download, AlertTriangle, CheckCircle, Loader2, Bug, ListChecks, GraduationCap, TerminalSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { initEngine, generateResponse, isEngineReady, type ChatMessage } from '@/lib/ai/engine';
import { checkAIHardware } from '@/utils/hardware';


interface AIPageProps {
    onBack: () => void;
}

type AIIntent = 'chat' | 'fix' | 'summary' | 'quiz' | 'next-steps' | 'command';

interface QuickAction {
    id: AIIntent;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'fix',
        label: 'Corriger erreur',
        icon: Bug,
        prompt: 'Analyse mon problème actuel et propose un plan de correction précis.'
    },
    {
        id: 'summary',
        label: 'Résumé',
        icon: ListChecks,
        prompt: 'Fais un résumé clair de cette conversation avec les points clés appris.'
    },
    {
        id: 'quiz',
        label: 'Mini quiz',
        icon: GraduationCap,
        prompt: 'Crée un mini quiz de 3 questions adapté à cette session.'
    },
    {
        id: 'command',
        label: 'Prochaine commande',
        icon: TerminalSquare,
        prompt: 'Donne la prochaine commande à lancer et explique pourquoi en une phrase.'
    }
];

function buildContextualPrompt(intent: AIIntent, userPrompt: string, conversationContext: string) {
    return [
        'Tu es TutoAI, assistant local orienté code/sécurité/Linux/Docker.',
        'Réponds en français, de façon concise et actionnable.',
        'Ne noie pas la réponse; donne des étapes testables.',
        `Intent: ${intent}`,
        '',
        'Contexte conversation récent:',
        conversationContext || '(aucun)',
        '',
        'Demande utilisateur:',
        userPrompt,
        '',
        'Format:',
        '1) Diagnostic court',
        '2) Étapes immédiates',
        '3) Vérification'
    ].join('\n');
}

export function AIPage({ onBack }: AIPageProps) {
    // States: 'intro', 'loading', 'chat', 'error'
    const [viewState, setViewState] = useState<'intro' | 'loading' | 'chat' | 'error'>('intro');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "system",
            content: "You are TutoAI, an expert coding assistant specializing in Security, Linux, and Docker. You answer concisely and strictly. Use Markdown."
        },
        {
            role: "assistant",
            content: "👋 **Système TutoAI Initialisé.**\n\nJe suis prêt à analyser votre code ou répondre à vos questions de cybersécurité. Je tourne à 100% sur votre GPU."
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState("");
    const [hardwareReport, setHardwareReport] = useState<any>(null);
    const [runningIntent, setRunningIntent] = useState<AIIntent | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, viewState]);

    // Check Hardware on Mount
    useEffect(() => {
        if (isEngineReady()) {
            setViewState('chat');
        } else {
            checkAIHardware().then(report => {
                setHardwareReport(report);
                if (!report.compatible) {
                    console.warn("Hardware warning:", report.criticalError);
                }
            });
        }
    }, []);

    const handleStartEngine = async () => {
        setViewState('loading');
        try {
            await initEngine((report) => {
                setProgress(report.progress);
                setProgressText(report.text);
            });
            setViewState('chat');
        } catch (error: any) {
            console.error("AI Engine Error:", error);
            setViewState('error');
            setProgressText(error.message || "Erreur inconnue lors du chargement du modèle.");
        }
    };

    const runIntent = async (
        intent: AIIntent,
        prompt: string,
        displayText: string,
        clearInput = true
    ) => {
        if (!prompt.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: "user", content: displayText };
        setMessages(prev => [...prev, userMsg]);
        if (clearInput) {
            setInput("");
            if (inputRef.current) inputRef.current.style.height = 'auto';
        }

        setIsLoading(true);
        setRunningIntent(intent);

        try {
            const conversationContext = messages
                .filter(msg => msg.role !== 'system')
                .slice(-8)
                .map(msg => `${msg.role}: ${msg.content.replace(/\s+/g, ' ').trim()}`)
                .join('\n');

            const contextualPrompt = buildContextualPrompt(intent, prompt, conversationContext);

            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            await generateResponse([...messages, { role: "user", content: contextualPrompt }], (text) => {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { role: "assistant", content: text };
                    return newMsgs;
                });
            });
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: "assistant", content: "❌ Erreur de génération. Le moteur a peut-être crashé (OOM)." }]);
        } finally {
            setIsLoading(false);
            setRunningIntent(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const normalized = input.trim();
        const [command, ...rest] = normalized.split(' ');
        const commandArg = rest.join(' ').trim();

        if (command.startsWith('/')) {
            switch (command.toLowerCase()) {
                case '/help':
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'Commandes disponibles: /fix, /summary, /quiz, /next, /cmd, /help'
                    }]);
                    setInput('');
                    if (inputRef.current) inputRef.current.style.height = 'auto';
                    return;
                case '/fix':
                    await runIntent('fix', commandArg || 'Aide-moi à corriger mon problème actuel.', normalized);
                    return;
                case '/summary':
                    await runIntent('summary', commandArg || 'Fais un résumé des points clés de cette session.', normalized);
                    return;
                case '/quiz':
                    await runIntent('quiz', commandArg || 'Crée un mini quiz sur cette session.', normalized);
                    return;
                case '/next':
                    await runIntent('next-steps', commandArg || 'Donne-moi les prochaines étapes de progression.', normalized);
                    return;
                case '/cmd':
                    await runIntent('command', commandArg || 'Quelle est la prochaine commande utile à lancer ?', normalized);
                    return;
                default:
                    await runIntent('chat', `Commande inconnue: ${command}. Explique brièvement les commandes disponibles.`, normalized);
                    return;
            }
        }

        await runIntent('chat', normalized, normalized);
    };

    const handleQuickAction = async (action: QuickAction) => {
        await runIntent(action.id, action.prompt, `🎯 ${action.label}`, false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="p-4 flex items-center sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
                <Button variant="ghost" onClick={onBack} className="gap-2 text-zinc-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" /> Retour
                </Button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                {viewState === 'intro' && (
                    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto h-full p-6 animate-in fade-in zoom-in duration-500">
                        <div className="text-center mb-8 space-y-4">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-indigo-/10 border border-indigo-/20 mb-4 animate-pulse-slow">
                                <Cpu className="w-16 h-16 text-indigo-400" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo- to-indigo-">
                                TutoAI <span className="text-lg font-mono text-zinc-500">v2.0 Local</span>
                            </h1>
                            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                                L'intelligence artificielle souveraine qui respecte vos données.
                                Exécution 100% locale via WebGPU.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 w-full mb-12">
                            <Card className="p-6 bg-zinc-900/50 border-zinc-700/50 backdrop-blur hover:bg-zinc-900/80 transition-all">
                                <Shield className="w-8 h-8 text-green-400 mb-4" />
                                <h3 className="font-semibold text-white mb-2">100% Privé</h3>
                                <p className="text-sm text-zinc-400">Aucune donnée ne quitte votre appareil. Vos prompts restent chez vous.</p>
                            </Card>
                            <Card className="p-6 bg-zinc-900/50 border-zinc-700/50 backdrop-blur hover:bg-zinc-900/80 transition-all">
                                <WifiOff className="w-8 h-8 text-indigo-400 mb-4" />
                                <h3 className="font-semibold text-white mb-2">Fonctionne Offline</h3>
                                <p className="text-sm text-zinc-400">Une fois le modèle téléchargé, coupez Internet. L'IA continue de répondre.</p>
                            </Card>
                            <Card className="p-6 bg-zinc-900/50 border-zinc-700/50 backdrop-blur hover:bg-zinc-900/80 transition-all">
                                <Terminal className="w-8 h-8 text-purple-400 mb-4" />
                                <h3 className="font-semibold text-white mb-2">Expert Code</h3>
                                <p className="text-sm text-zinc-400">Modèle Phi-3.5 optimisé pour le code (Linux, Docker, Python). Réponse en ~50ms.</p>
                            </Card>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 max-w-2xl w-full mb-8 flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                            <div className="text-left">
                                <h4 className="font-semibold text-amber-200">Pré-requis Système & Téléchargement</h4>
                                <ul className="text-sm text-amber-200/70 mt-2 space-y-1 list-disc list-inside">
                                    <li>Espace requis : ~2.0 Go (Mise en cache unique)</li>
                                    <li>GPU requis : Carte graphique compatible WebGPU (RTX, M1/M2/M3, Radeon récent)</li>
                                    <li>Navigateur : Chrome, Edge ou Brave recommandé</li>
                                    <li>Connexion Wi-Fi fortement recommandée pour le premier lancement</li>
                                </ul>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            onClick={handleStartEngine}
                            className="bg-indigo-500 hover:bg-indigo-500 text-white px-8 py-6 text-lg shadow-lg shadow-indigo-/20 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Initialiser TutoAI (Téléchargement requis ~2Go)
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>

                        {hardwareReport && !hardwareReport.compatible && (
                            <p className="mt-4 text-red-400 text-sm">
                                ⚠️ Attention : Votre matériel semble incompatible. L'IA risque de ne pas démarrer.
                            </p>
                        )}
                    </div>
                )}

                {viewState === 'loading' && (
                    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto h-full p-6 text-center">
                        <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mb-8" />
                        <h2 className="text-2xl font-bold text-white mb-4">Initialisation du Neural Engine</h2>

                        <div className="w-full space-y-2 mb-8">
                            <div className="flex justify-between text-xs uppercase tracking-wider text-zinc-500 font-mono">
                                <span>Téléchargement des poids...</span>
                                <span>{Math.round(progress * 100)}%</span>
                            </div>
                            <Progress value={progress * 100} className="h-4 bg-zinc-800" />
                            <p className="text-xs font-mono text-indigo-/80 h-6">{progressText}</p>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-lg text-left space-y-4">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Vérification GPU WebGL/WebGPU</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <CheckCircle className={cn("w-4 h-4", progress > 0.1 ? "text-green-500" : "text-zinc-700")} />
                                <span className="text-sm">Chargement du Tokenizer</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <CheckCircle className={cn("w-4 h-4", progress > 0.5 ? "text-green-500" : "text-zinc-700")} />
                                <span className="text-sm">Compilation des Shaders GPU</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <div className={cn("w-4 h-4 shrink-0 rounded-full border-2", progress >= 1 ? "border-green-500 bg-green-500" : "border-zinc-700 border-t-indigo- animate-spin")} />
                                <span className="text-sm">Mise en cache du Modèle (Lourd)</span>
                            </div>
                        </div>

                        <p className="mt-8 text-sm text-zinc-500 italic">
                            Ceci ne se produit qu'une seule fois. Les prochains lancements seront instantanés.
                        </p>
                    </div>
                )}

                {viewState === 'chat' && (
                    <div className="flex flex-col h-full max-w-5xl mx-auto bg-zinc-950/50 border-x border-zinc-800/50 shadow-2xl">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-green-500 absolute -right-0.5 -bottom-0.5 border-2 border-zinc-950 animate-pulse" />
                                    <Cpu className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg">TutoAI <span className="text-indigo-400">Pro</span></h2>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Encrypted & Local</span>
                                        <span>•</span>
                                        <span className="font-mono text-indigo-/80">Phi-3.5-mini</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
                            <div className="space-y-6 pb-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={cn("flex w-full gap-4", msg.role === "user" ? "justify-end" : "justify-start")}>
                                        {msg.role === "assistant" && (
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                                                <Cpu className="w-5 h-5 text-indigo-400" />
                                            </div>
                                        )}

                                        <div className={cn(
                                            "max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-5 text-sm leading-relaxed shadow-lg",
                                            msg.role === "user"
                                                ? "bg-indigo-500 text-white rounded-br-none"
                                                : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-none"
                                        )}>
                                            {msg.content.split('\n').map((line, i) => (
                                                <p key={i} className="min-h-[1em] mb-1 last:mb-0 break-words font-light">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>

                                        {msg.role === "user" && (
                                            <div className="w-8 h-8 rounded-full bg-indigo-/30 flex items-center justify-center shrink-0 border border-indigo-/30">
                                                <div className="w-4 h-4 rounded-full bg-indigo-500" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex w-full gap-4 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700 animate-pulse">
                                            <Cpu className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Chat Input Area */}
                        <div className="p-4 md:p-6 bg-zinc-950 border-t border-zinc-800/50">
                            <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                                {QUICK_ACTIONS.map((action) => {
                                    const Icon = action.icon;
                                    const isCurrent = runningIntent === action.id;
                                    return (
                                        <Button
                                            key={action.id}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs whitespace-nowrap"
                                            disabled={isLoading}
                                            onClick={() => handleQuickAction(action)}
                                        >
                                            <Icon className="w-3.5 h-3.5 mr-1.5" />
                                            {isCurrent ? '...' : action.label}
                                        </Button>
                                    );
                                })}
                            </div>
                            <div className="relative flex items-end gap-2 bg-zinc-900/50 border border-zinc-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-/30 transition-all">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Posez votre question... (/help pour les commandes)"
                                    className="w-full min-h-[50px] max-h-[200px] py-3 px-4 bg-transparent border-none focus:outline-none text-zinc-200 resize-none text-base disabled:opacity-50"
                                    disabled={isLoading}
                                    rows={1}
                                />
                                <Button
                                    size="icon"
                                    className="mb-1 mr-1 h-10 w-10 rounded-lg bg-indigo-500 hover:bg-indigo-500 text-white transition-colors"
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !input.trim()}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </Button>
                            </div>
                            <p className="mt-2 text-[11px] text-zinc-500 text-center">IA locale: /fix • /summary • /quiz • /next • /cmd</p>
                        </div>
                    </div>
                )}

                {viewState === 'error' && (
                    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto h-full p-6 text-center">
                        <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">Échec de l'initialisation</h2>
                        <p className="text-red-300 mb-8 max-w-md mx-auto">{progressText}</p>

                        <div className="bg-zinc-900/50 p-6 rounded-lg text-left text-sm text-zinc-400 mb-8 border border-white/5">
                            <p className="mb-2 font-semibold text-white">Causes possibles :</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Pas assez de mémoire vidéo (VRAM)</li>
                                <li>Navigateur incompatible avec WebGPU</li>
                                <li>Connexion interrompue pendant le téléchargement</li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={() => window.location.reload()} variant="outline">Recharger la page</Button>
                            <Button onClick={handleStartEngine} className="bg-indigo-500 hover:bg-indigo-500">Réessayer</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
