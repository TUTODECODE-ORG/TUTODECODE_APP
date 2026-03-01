import React, { useState, useEffect, useRef } from "react";
import { X, Cpu, Minimize2, Maximize2, Loader2, Send, FolderOpen, Shield, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { invoke } from "@tauri-apps/api/core";
// Import our engine wrapper
import { initEngine, generateResponse, isEngineReady, type ChatMessage } from "@/lib/ai/engine";


interface AIAssistantProps {
    className?: string;
}

interface CommandResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface LocalAiStatus {
    available: boolean;
    mode: string;
    provider: string;
    model: string;
    error?: string;
}

interface WorkspaceSnippet {
    name: string;
    content: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
    const isDesktopApp = typeof window !== 'undefined' && Boolean((window as any).__TAURI_INTERNALS__ || (window as any).__TAURI__);
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "system",
            content: "Tu es GhostAI, assistant expert en développement, cybersécurité, DevOps et administration système. Réponds toujours en français, de façon concise, directe et professionnelle. Utilise Markdown pour le code. Si la demande n'est pas technique, refuse poliment."
        },
        {
            role: "assistant",
            content: "GhostAI prêt. Posez vos questions sur le code, la sécurité ou l'infrastructure."
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEngineLoading, setIsEngineLoading] = useState(false);
    const [engineFailed, setEngineFailed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState("");
    const [localAiStatus, setLocalAiStatus] = useState<LocalAiStatus | null>(null);
    const [localAiStatusChecked, setLocalAiStatusChecked] = useState(false);
    const [workspacePathHint, setWorkspacePathHint] = useState<string>("");
    const [workspaceSnippets, setWorkspaceSnippets] = useState<WorkspaceSnippet[]>([]);
    const [ollamaGuidanceShown, setOllamaGuidanceShown] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const openUrl = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const refreshLocalAiStatus = async () => {
        if (!isDesktopApp) {
            setLocalAiStatus(null);
            setLocalAiStatusChecked(true);
            return;
        }

        try {
            const result = await invoke<CommandResult<LocalAiStatus>>('check_local_ai_status');
            if (result.success && result.data) {
                setLocalAiStatus(result.data);
            } else {
                setLocalAiStatus({
                    available: false,
                    mode: 'simulation',
                    provider: 'ollama',
                    model: 'local',
                    error: result.error || 'Ollama non détecté'
                });
            }
        } catch (error: any) {
            setLocalAiStatus({
                available: false,
                mode: 'simulation',
                provider: 'ollama',
                model: 'local',
                error: error?.message || 'Échec détection IA locale'
            });
        } finally {
            setLocalAiStatusChecked(true);
        }
    };

    const shouldUseLocalAi = isDesktopApp && !!localAiStatus?.available;
    const shouldShowInstallActions = isDesktopApp && localAiStatusChecked && !localAiStatus?.available;
    const shouldBlockInput = isLoading || (engineFailed && !shouldUseLocalAi);

    useEffect(() => {
        if (isOpen) {
            refreshLocalAiStatus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isDesktopApp || !localAiStatusChecked || !localAiStatus?.available) return;

        setMessages((prev) => prev.filter((msg) => {
            if (msg.role !== 'assistant') return true;
            return !msg.content.includes('Code d\'information: OLLAMA_SETUP_HELP');
        }));

        setEngineFailed(false);
        setOllamaGuidanceShown(false);
    }, [isDesktopApp, localAiStatusChecked, localAiStatus]);

    useEffect(() => {
        if (!isDesktopApp || !isOpen) return;
        if (!localAiStatusChecked || localAiStatus?.available || ollamaGuidanceShown) return;

        const errorHint = localAiStatus?.error ? `\nDétail: ${localAiStatus.error}` : '';
        setMessages((prev) => {
            const alreadyShown = prev.some((msg) => msg.role === 'assistant' && msg.content.includes('Code d\'information: OLLAMA_SETUP_HELP'));
            if (alreadyShown) return prev;
            return [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        `⚠️ Ollama n'est pas détecté sur 127.0.0.1:11434.${errorHint}\n\n` +
                        `Pour activer GhostAI local:\n` +
                        `1) Installez Ollama\n` +
                        `2) Installez un modèle (ex: llama3.2:3b)\n` +
                        `3) Relancez l'app\n\n` +
                        `Vous pouvez cliquer sur les boutons d'installation ci-dessous.\n\n` +
                        `Code d'information: OLLAMA_SETUP_HELP`
                }
            ];
        });
        setOllamaGuidanceShown(true);
    }, [isDesktopApp, isOpen, localAiStatusChecked, localAiStatus, ollamaGuidanceShown]);

    const handleInitEngine = async (): Promise<boolean> => {
        if (isEngineReady()) return true;

        setIsEngineLoading(true);
        try {
            await initEngine((report) => {
                setProgress(report.progress);
                setProgressLabel(report.text);
            });
            setEngineFailed(false);
            return true;
        } catch (error: any) {
            console.error("Failed to load engine", error);
            setEngineFailed(true);
            setMessages(prev => {
                const alreadyShown = prev.some((msg) => msg.role === 'assistant' && msg.content.includes('WEBLLM_INIT_FAILED'));
                if (alreadyShown) return prev;
                return [...prev, {
                    role: "assistant",
                    content: `⚠️ **Initialisation IA échouée**\n\n${error.message || "Erreur inconnue"}\n\nLe moteur WebLLM n'a pas pu démarrer dans ce navigateur.\n\n**À vérifier :**\n1. Utiliser Chrome/Edge récent et activer l'accélération matérielle.\n2. Vérifier WebGPU (chrome://gpu).\n3. Recharger la page (Ctrl+F5) pour vider les artefacts en cache.\n\n*Code d'erreur: WEBLLM_INIT_FAILED*`
                }];
            });
            return false;
        } finally {
            setIsEngineLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const rawUserInput = input;
        const userMsg: ChatMessage = { role: "user", content: rawUserInput };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Optimistic update for stream
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            const contextBlock = workspaceSnippets.length
                ? `\n\nContexte fichiers utilisateur (workspace):\n${workspaceSnippets.map((f) => `- ${f.name}\n${f.content}`).join('\n\n')}`
                : '';

            const localPrompt = `${rawUserInput}\n\nRéponds uniquement en français.${contextBlock}`;

            if (isDesktopApp && !localAiStatus?.available) {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = {
                        role: 'assistant',
                        content:
                            `Ollama local n'est pas joignable (127.0.0.1:11434).\n` +
                            `Je bascule temporairement en mode WebLLM navigateur.\n\n` +
                            `Pour revenir en mode local: installez Ollama + modèle via les boutons du panneau.`
                    };
                    return newMsgs;
                });
            }

            if (isDesktopApp && localAiStatus?.available) {
                const localResult = await invoke<CommandResult<string>>('ask_local_ai', { prompt: localPrompt });
                const reply = localResult.success ? (localResult.data || 'Réponse locale vide.') : (localResult.error || 'Erreur IA locale.');
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { role: "assistant", content: reply };
                    return newMsgs;
                });
                return;
            }

            // Fallback navigateur WebLLM
            if (!isEngineReady()) {
                const ready = await handleInitEngine();
                if (!ready) {
                    setIsLoading(false);
                    return;
                }
            }

            const llmUserMessage: ChatMessage = {
                role: "user",
                content: localPrompt
            };

            await generateResponse([...messages, llmUserMessage], (text) => {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { role: "assistant", content: text };
                    return newMsgs;
                });
            });
        } catch (err) {
            console.error(err);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: "assistant", content: "Erreur de génération. Veuillez réessayer." };
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handlePickWorkspace = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.rs', '.py', '.json', '.toml', '.md', '.yaml', '.yml'];
        const textFiles = files
            .filter((file) => allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext)))
            .slice(0, 6);

        const snippets: WorkspaceSnippet[] = [];

        for (const file of textFiles.slice(0, 3)) {
            try {
                const content = await file.text();
                snippets.push({
                    name: file.webkitRelativePath || file.name,
                    content: content.slice(0, 1600)
                });
            } catch {
                // ignore single file read failure
            }
        }

        setWorkspaceSnippets(snippets);
        setWorkspacePathHint(textFiles[0]?.webkitRelativePath?.split('/')[0] || 'workspace sélectionné');

        setMessages((prev) => [
            ...prev,
            {
                role: 'assistant',
                content: snippets.length > 0
                    ? `✅ Dossier autorisé: ${textFiles.length} fichier(s) détecté(s). Je peux maintenant analyser votre projet et vous guider sur les erreurs.`
                    : '⚠️ Dossier sélectionné, mais aucun fichier texte exploitable détecté pour l’analyse.'
            }
        ]);
    };

    const handleAnalyzeWorkspace = async () => {
        if (workspaceSnippets.length === 0) {
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: 'Sélectionnez d’abord un dossier projet pour lancer une analyse.'
            }]);
            return;
        }

        const analysisRequest = [
            'Analyse ces fichiers du workspace utilisateur.',
            'Détecte erreurs probables, risques sécurité, mauvaises pratiques et étapes de correction.',
            'Réponds en français avec: 1) Diagnostic 2) Correctifs 3) Vérification.',
            '',
            'Fichiers:',
            ...workspaceSnippets.map((f) => `--- ${f.name}\n${f.content}`)
        ].join('\n');

        setInput(analysisRequest);
        setTimeout(() => {
            handleSendMessage();
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Render loading state for model
    if (isEngineLoading) {
        return (
            <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-2xl glass-effect">
                <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="animate-spin text-cyan-400 w-4 h-4" />
                    <span className="text-sm font-semibold text-slate-200">Initialisation du moteur IA...</span>
                </div>
                <Progress value={progress * 100} className="h-2 mb-2 bg-slate-800" />
                <p className="text-xs text-slate-400 truncate animate-pulse">{progressLabel}</p>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <Button
                onClick={() => {
                    setIsOpen(true);
                    if (!isDesktopApp) {
                        handleInitEngine();
                    }
                }}
                className={cn("fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 bg-[#0f172a] border border-cyan-500/30 text-cyan-400 hover:bg-[#1e293b]", className)}
                aria-label="Discuter avec l'IA"
            >
                <Cpu className="w-6 h-6 animate-pulse-slow" />
            </Button>
        );
    }

    return (
        <Card className={cn(
            "fixed z-50 transition-all duration-300 flex flex-col glass-morphism border-slate-700 bg-[#0f172a]/95 backdrop-blur-md shadow-2xl",
            isExpanded ? "inset-4 bottom-4 right-4 w-auto h-auto" : "bottom-6 right-6 w-96 h-[600px]"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-[#0f172a]/50">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse absolute -right-0.5 -top-0.5 border border-[#0f172a]" />
                        <Cpu className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="font-semibold text-sm text-slate-100 tracking-wide">GhostAI <span className="text-xs text-slate-400 font-normal">v2.0 Local</span></span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="px-3 py-2 border-b border-slate-700/50 bg-[#0d1629] space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    {isDesktopApp ? (
                        <span className={cn(
                            'px-2 py-1 rounded border',
                            !localAiStatusChecked
                                ? 'text-slate-300 border-slate-500/40 bg-slate-500/10'
                                : localAiStatus?.available
                                    ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
                                    : 'text-amber-300 border-amber-500/40 bg-amber-500/10'
                        )}>
                            {!localAiStatusChecked
                                ? 'Vérification IA locale...'
                                : localAiStatus?.available
                                    ? 'IA locale active · 127.0.0.1:11434'
                                    : 'Ollama non détecté'}
                        </span>
                    ) : (
                        <span className="px-2 py-1 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">Mode navigateur (WebLLM)</span>
                    )}
                    {workspacePathHint && (
                        <span className="px-2 py-1 rounded border border-slate-600 text-slate-300">Dossier: {workspacePathHint}</span>
                    )}
                </div>

                <div className={cn(
                    'text-[10px] rounded border px-2 py-1',
                    isDesktopApp && localAiStatus?.available
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
                        : isDesktopApp && !localAiStatusChecked
                            ? 'border-slate-500/30 bg-slate-500/5 text-slate-200'
                            : 'border-cyan-500/30 bg-cyan-500/5 text-cyan-200'
                )}>
                    {isDesktopApp && !localAiStatusChecked
                        ? 'Mode actif: vérification du moteur local en cours...'
                        : isDesktopApp && localAiStatus?.available
                        ? 'Mode actif: Ollama local · WebLLM désactivé tant que le serveur local est disponible.'
                        : 'Mode actif: WebLLM navigateur (fallback).'}
                </div>

                <div className="flex flex-wrap gap-2">
                    {shouldShowInstallActions && (
                        <>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openUrl('/downloads/Install-Ollama-Modele.bat')}>
                                <Download className="w-3.5 h-3.5 mr-1" /> Installer Ollama + modèle (.bat)
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openUrl('https://ollama.com/download')}>
                                <Download className="w-3.5 h-3.5 mr-1" /> Installer Ollama
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openUrl('https://ollama.com/library/llama3.2')}>
                                <Shield className="w-3.5 h-3.5 mr-1" /> Installer un modèle
                            </Button>
                        </>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => folderInputRef.current?.click()}>
                        <FolderOpen className="w-3.5 h-3.5 mr-1" /> Choisir dossier
                    </Button>
                    <Button size="sm" className="h-7 text-xs" onClick={handleAnalyzeWorkspace}>
                        Analyser fichiers
                    </Button>
                </div>

                <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handlePickWorkspace}
                    {...({ webkitdirectory: "", directory: "" } as any)}
                />
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 bg-[#0B1221]/50" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                        msg.role !== "system" && (
                            <div key={idx} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[85%] rounded-lg p-3 text-sm leading-relaxed shadow-sm",
                                    msg.role === "user"
                                        ? "bg-cyan-600 text-white rounded-br-none"
                                        : "bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none"
                                )}>
                                    {/* Simple Markdown rendering could go here, for now raw text */}
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className="min-h-[1em]">{line}</p>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 border border-slate-700 rounded-lg rounded-bl-none p-3 max-w-[85%] flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                                <span className="text-xs text-slate-400">Traitement local en cours...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-700/50 bg-[#0f172a]">
                <div className="relative flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Posez une question (sécurité, Docker, Linux...)"
                        className="pr-10 bg-slate-900 border-slate-700 focus-visible:ring-cyan-500/50 text-slate-200"
                        disabled={shouldBlockInput}
                    />
                    <Button
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 hover:bg-cyan-600 bg-cyan-500/20 text-cyan-400 hover:text-white transition-colors"
                        onClick={handleSendMessage}
                        disabled={shouldBlockInput || !input.trim()}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
                <div className="mt-2 flex justify-between items-center px-1">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                        {isDesktopApp && localAiStatus?.available ? `Modèle local: ${localAiStatus.model}` : 'Modèle: WebLLM SmolLM2'}
                    </span>
                    <span className="text-[10px] text-slate-600">Confidentiel • Exécution locale</span>
                </div>
            </div>
        </Card>
    );
}
