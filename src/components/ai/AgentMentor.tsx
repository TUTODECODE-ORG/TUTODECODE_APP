// ============================================
// TutoDeCode Pro - AgentMentor
// Agent IA connecté à Ollama local
// ============================================

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { 
  Bot, 
  Sparkles, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  ChevronDown,
  Send,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { TerminalOutput } from '@/hooks/useTerminal';

// ============================================
// TYPES
// ============================================
export interface AgentMessage {
  id: string;
  type: 'hint' | 'error' | 'success' | 'info' | 'encouragement' | 'user';
  content: string;
  codeSnippet?: string;
  timestamp: number;
  relatedToError?: string;
}

export interface AgentMentorProps {
  terminalOutput: TerminalOutput[];
  currentChapter?: string;
  ollamaModel?: string;
  onRequestHint?: () => void;
  className?: string;
}

interface OllamaStatus {
  connected: boolean;
  model: string | null;
  availableModels: string[];
}

// ============================================
// OLLAMA API
// ============================================
const OLLAMA_URL = 'http://localhost:11434';

async function checkOllamaConnection(): Promise<OllamaStatus> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      const data = await response.json();
      const models = data.models?.map((m: { name: string }) => m.name.split(':')[0]) || [];
      return {
        connected: true,
        model: models[0] || null,
        availableModels: models
      };
    }
    return { connected: false, model: null, availableModels: [] };
  } catch {
    return { connected: false, model: null, availableModels: [] };
  }
}

async function askOllama(model: string, prompt: string, systemPrompt?: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      system: systemPrompt || `Tu es un mentor de programmation pour TutoDeCode Pro. 
Tu aides les étudiants à apprendre Rust et Tauri.
- Ne donne JAMAIS la réponse directement
- Guide l'étudiant avec des indices
- Encourage et motive
- Sois concis (2-3 phrases max)
- Si c'est une erreur de code, explique pourquoi ça ne marche pas`,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 200
      }
    }),
    signal: AbortSignal.timeout(30000)
  });
  
  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.response || 'Pas de réponse';
}

// ============================================
// PATTERNS DE DÉTECTION D'ERREURS
// ============================================
interface ErrorPattern {
  pattern: RegExp;
  type: 'rust' | 'cargo' | 'system' | 'general';
  hint: string;
  codeFix?: string;
  encouragement?: string;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /cannot find.*in this scope|not found in this scope/i,
    type: 'rust',
    hint: 'Il semble qu\'une variable ou fonction n\'existe pas dans ce scope. Vérifiez que vous l\'avez bien déclarée et qu\'elle est accessible.',
    codeFix: 'let ma_variable = "valeur"; // Déclarez avant utilisation',
    encouragement: 'Les erreurs de scope sont courantes en Rust. Vérifiez vos déclarations !'
  },
  {
    pattern: /borrow checker|cannot borrow.*as mutable.*also borrowed|cannot move/i,
    type: 'rust',
    hint: 'Le Borrow Checker de Rust protège la mémoire. Vous ne pouvez pas avoir plusieurs références mutables simultanément. Utilisez clone() ou restructurez votre code.',
    codeFix: 'let data_clone = data.clone(); // Clone si nécessaire',
    encouragement: 'Le Borrow Checker est votre ami ! Il prévient les bugs de mémoire.'
  },
    {
    pattern: /expected.*found|mismatched types|type mismatch/i,
    type: 'rust',
    hint: 'Les types ne correspondent pas. Rust est fortement typé ! Vérifiez les signatures de fonction et utilisez .into() ou .parse() pour les conversions.',
    codeFix: 'let nombre: i32 = texte.parse()?; // Conversion explicite',
    encouragement: 'Les types explicites rendent votre code plus sûr. Prenez le temps de bien les définir !'
  },
  {
    pattern: /unwrap.*on a None value|called Option::unwrap.*on a None/i,
    type: 'rust',
    hint: 'Vous avez appelé .unwrap() sur une valeur None ! Utilisez plutôt match ou if let pour gérer le cas None gracieusement.',
    codeFix: `if let Some(valeur) = option {
    // utiliser valeur
} else {
    // gérer le cas None
}`,
    encouragement: 'Évitez unwrap() en production. Préférez la gestion d\'erreurs explicite !'
  },
  {
    pattern: /missing.*in implementation|not implemented|unimplemented/i,
    type: 'rust',
    hint: 'Une méthode ou trait n\'est pas implémentée. Vérifiez que vous avez bien implémenté tous les membres requis.',
    codeFix: `impl MonTrait for MaStruct {
    fn methode_requise(&self) {
        // implémentation
    }
}`,
    encouragement: 'Les traits sont puissants ! Assurez-vous d\'implémenter tous les membres.'
  },
  {
    pattern: /failed to run|could not compile|build failed/i,
    type: 'cargo',
    hint: 'La compilation a échoué. Lisez attentivement les erreurs au-dessus - elles indiquent exactement où est le problème.',
    codeFix: 'cargo check  // Vérifiez sans compiler',
    encouragement: 'Les erreurs de compilation sont normales. Corrigez-les une par une !'
  },
  {
    pattern: /permission denied|access denied|EACCES/i,
    type: 'system',
    hint: 'Permission refusée. Sur Linux/macOS, utilisez sudo pour les opérations privilégiées. Sur Windows, exécutez en tant qu\'administrateur.',
    codeFix: 'sudo cargo build  // Avec privilèges élevés',
    encouragement: 'Les permissions sont importantes pour la sécurité. Ne donnez pas plus d\'accès que nécessaire !'
  },
  {
    pattern: /command not found|is not recognized/i,
    type: 'system',
    hint: 'La commande n\'est pas trouvée. Assurez-vous que l\'outil est installé et dans votre PATH.',
    codeFix: 'cargo install cargo-tauri  // Installez si manquant',
    encouragement: 'Vérifiez votre installation. Rust et Cargo doivent être dans le PATH !'
  },
  {
    pattern: /panic|thread.*panicked/i,
    type: 'rust',
    hint: 'Un panic a été déclenché ! C\'est une erreur fatale en runtime. Utilisez Result et ? pour gérer les erreurs proprement.',
    codeFix: `fn ma_fonction() -> Result<T, E> {
    risky_operation()?;  // Propagation d'erreur
    Ok(result)
}`,
    encouragement: 'Les panics sont évitables avec une bonne gestion d\'erreurs. Utilisez Result !'
  },
  {
    pattern: /deadlock|would deadlock/i,
    type: 'rust',
    hint: 'Un deadlock a été détecté ! Vous avez probablement verrouillé le même Mutex dans l\'ordre inverse. Libérez toujours les locks dans le même ordre.',
    codeFix: `// ❌ Mauvais ordre
let a = mutex_a.lock()?;
let b = mutex_b.lock()?;  // Risque de deadlock

// ✅ Bon ordre (toujours A puis B)
let a = mutex_a.lock()?;
let b = mutex_b.lock()?;`,
    encouragement: 'Les deadlocks sont difficiles à déboguer. Soyez rigoureux avec l\'ordre des locks !'
  }
];

// ============================================
// MESSAGES D'ENCOURAGEMENT
// ============================================
const ENCOURAGEMENTS = [
  { type: 'success', message: '🎉 Excellent ! Votre code compile parfaitement.' },
  { type: 'success', message: '✨ Bravo ! Vous maîtrisez ce concept.' },
  { type: 'success', message: '🚀 Super ! Continuez sur cette lancée.' },
  { type: 'success', message: '💪 Impressionnant ! Vous progressez vite.' },
  { type: 'success', message: '⭐ Parfait ! Votre solution est élégante.' },
  { type: 'info', message: '💡 Astuce: Utilisez cargo check pour vérifier rapidement.' },
  { type: 'info', message: '📚 Rappel: Le borrow checker est votre ami, pas votre ennemi !' },
  { type: 'info', message: '🔧 Conseil: Lisez toujours le message d\'erreur complet.' }
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export const AgentMentor = memo<AgentMentorProps>(({
  terminalOutput,
  currentChapter,
  ollamaModel,
  onRequestHint,
  className
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    connected: false,
    model: null,
    availableModels: []
  });
  const [selectedModel, setSelectedModel] = useState<string>(ollamaModel || '');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const processedOutputsRef = useRef<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  // Vérifier la connexion Ollama au montage et régulièrement
  const checkConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      const status = await checkOllamaConnection();
      setOllamaStatus(status);
      
      // Si un modèle est disponible et pas encore sélectionné
      if (status.connected && status.availableModels.length > 0 && !selectedModel) {
        setSelectedModel(status.availableModels[0]);
      }
    } finally {
      setIsCheckingConnection(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    checkConnection();
    
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Mettre à jour le modèle si passé en props
  useEffect(() => {
    if (ollamaModel) {
      setSelectedModel(ollamaModel);
    }
  }, [ollamaModel]);

  const getViewport = useCallback(() => {
    return scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
  }, []);

  const updateScrollIndicators = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return;

    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    const scrollTop = viewport.scrollTop;
    const nearBottom = maxScroll - scrollTop <= 24;

    setShowTopShadow(scrollTop > 4);
    setShowBottomShadow(maxScroll > 4 && !nearBottom);
    setAutoScrollEnabled(nearBottom);
  }, [getViewport]);

  useEffect(() => {
    const viewport = getViewport();
    if (!viewport) return;

    const onViewportScroll = () => updateScrollIndicators();
    viewport.addEventListener('scroll', onViewportScroll, { passive: true });
    updateScrollIndicators();

    return () => {
      viewport.removeEventListener('scroll', onViewportScroll);
    };
  }, [getViewport, updateScrollIndicators]);

  useEffect(() => {
    const viewport = getViewport();
    if (!viewport) return;

    if (autoScrollEnabled) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }

    const frame = requestAnimationFrame(updateScrollIndicators);
    return () => cancelAnimationFrame(frame);
  }, [messages, isTyping, autoScrollEnabled, getViewport, updateScrollIndicators]);

  // ============================================
  // DÉTECTION DES ERREURS
  // ============================================
  const analyzeOutput = useCallback((output: TerminalOutput) => {
    if (output.type !== 'error' && output.type !== 'output') return;
    
    const outputId = `${output.timestamp}-${output.content.slice(0, 50)}`;
    if (processedOutputsRef.current.has(outputId)) return;
    processedOutputsRef.current.add(outputId);

    // Cherche les patterns d'erreur
    for (const errorPattern of ERROR_PATTERNS) {
      if (errorPattern.pattern.test(output.content)) {
        setIsTyping(true);
        
        setTimeout(() => {
          const newMessage: AgentMessage = {
            id: Date.now().toString(),
            type: 'error',
            content: errorPattern.hint,
            codeSnippet: errorPattern.codeFix,
            timestamp: Date.now(),
            relatedToError: output.content.slice(0, 100)
          };
          
          setMessages(prev => [...prev, newMessage]);
          setIsTyping(false);
        }, 800);
        
        return;
      }
    }

    // Détecte les succès
    if (output.content.includes('Finished') || 
        output.content.includes('success') ||
        output.content.includes('✅') ||
        output.content.includes('🎉')) {
      
      const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * 5)];
      
      setTimeout(() => {
        const newMessage: AgentMessage = {
          id: Date.now().toString(),
          type: 'success',
          content: encouragement.message,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, newMessage]);
      }, 500);
    }
  }, []);

  // Analyse les nouvelles sorties du terminal
  useEffect(() => {
    const lastOutput = terminalOutput[terminalOutput.length - 1];
    if (lastOutput) {
      analyzeOutput(lastOutput);
    }
  }, [terminalOutput, analyzeOutput]);

  // ============================================
  // ENVOI DE MESSAGE UTILISATEUR
  // ============================================
  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim()) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      type: 'info',
      content: userInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const prompt = userInput;
    setUserInput('');

    // Réponse via Ollama (pont direct)
    setIsTyping(true);

    try {
      if (ollamaStatus.connected && selectedModel) {
        const response = await askOllama(selectedModel, prompt);

        const agentResponse: AgentMessage = {
          id: (Date.now() + 1).toString(),
          type: 'info',
          content: response,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, agentResponse]);
        return;
      }

      // Mode hors-ligne / Ollama non lancé
      const responses: Record<string, string> = {
        'aide': '🔌 Ollama n\'est pas connecté. Démarrez Ollama puis cliquez sur "Reconnecter".',
        'help': '🔌 Pour activer l\'IA, lancez Ollama avec la commande: ollama serve',
        'hint': 'Regardez les messages d\'erreur attentivement. Ils contiennent souvent la solution !',
        'indice': 'Vérifiez la documentation de Rust ou utilisez rustc --explain <code_erreur>'
      };

      const response = responses[prompt.toLowerCase()] ||
        '🔌 Mode hors-ligne. Démarrez Ollama pour activer le pont IA.';

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'info',
          content: response,
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'error',
          content: `❌ Erreur Ollama: ${errorMessage}`,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [userInput, ollamaStatus.connected, selectedModel]);

  // ============================================
  // DEMANDE D'INDICE
  // ============================================
  const handleRequestHint = useCallback(() => {
    onRequestHint?.();
    
    const hints: Record<string, string> = {
      'ch-01': 'Utilisez #[tauri::command] pour annoter votre fonction.',
      'ch-02': 'Mutex protège les données partagées. Utilisez .lock() pour y accéder.',
      'ch-03': 'Result<T, E> permet de gérer les erreurs. Utilisez ? pour propager.',
      'ch-04': 'Validez toujours les entrées utilisateur avant traitement.',
      'ch-05': 'AtomicU64 est lock-free et parfait pour les compteurs.',
      'ch-06': 'tokio::time::timeout limite le temps d\'exécution.',
      'ch-07': 'Écrivez dans un fichier .tmp puis renommez atomiquement.',
      'ch-08': 'Utilisez Stdio::piped() pour capturer stdout/stderr.',
      'ch-09': 'reqwest::Client réutilise les connexions pour plus de performance.',
      'ch-10': 'AtomicU64 avec Ordering::Relaxed suffit pour les statistiques.'
    };

    const hint = hints[currentChapter || ''] || 'Continuez à pratiquer dans le terminal !';

    const hintMessage: AgentMessage = {
      id: Date.now().toString(),
      type: 'hint',
      content: `💡 ${hint}`,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, hintMessage]);
  }, [currentChapter, onRequestHint]);

  // ============================================
  // RENDU
  // ============================================
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed bottom-4 right-4 z-50 flex items-center gap-2",
          "px-4 py-3 rounded-full bg-gradient-to-r from-[var(--td-primary)] to-[var(--td-accent-ai)]",
          "text-white shadow-lg hover:shadow-xl transition-all hover:scale-105",
          className
        )}
      >
        <Bot className="w-5 h-5" />
        <span className="font-medium">Agent IA</span>
        {messages.length > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={cn(
      "flex flex-col bg-[var(--td-surface)] border border-[var(--td-border)] rounded-xl overflow-hidden shadow-2xl",
      "w-96 h-[500px]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--td-border)] bg-gradient-to-r from-[var(--td-primary-muted)] to-transparent">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--td-primary)] to-[var(--td-accent-ai)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--td-surface)]",
              ollamaStatus.connected ? "bg-[var(--td-success)]" : "bg-amber-500"
            )} />
          </div>
          <div>
            <h3 className="font-medium text-sm text-[var(--td-text-primary)]">
              Agent Mentor
            </h3>
            <p className="text-xs text-[var(--td-text-secondary)]">
              {isTyping ? 'Analyse en cours...' : 'Surveillance active'}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {ollamaStatus.connected ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded border text-emerald-300 border-emerald-500/40 bg-emerald-500/10">
                    Connecté
                  </span>
                  <span className="text-[10px] text-[var(--td-text-tertiary)]">
                    {selectedModel || ollamaStatus.model}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded border text-amber-300 border-amber-500/40 bg-amber-500/10">
                    Hors-ligne
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[10px]"
                    onClick={checkConnection}
                    disabled={isCheckingConnection}
                  >
                    <RefreshCw className={cn("w-3 h-3 mr-1", isCheckingConnection && "animate-spin")} />
                    Reconnecter
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRequestHint}
            title="Demander un indice"
          >
            <Lightbulb className="w-4 h-4 text-[var(--td-accent-ai)]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(true)}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full p-3">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--td-primary-muted)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[var(--td-primary)]" />
              </div>
              <p className="text-sm text-[var(--td-text-secondary)]">
                Je surveille votre terminal en temps réel.
              </p>
              <p className="text-xs text-[var(--td-text-tertiary)] mt-2">
                Je détecterai les erreurs et vous guiderai vers la solution.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestHint}
                className="mt-4"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Demander un indice
              </Button>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "p-3 rounded-lg text-sm",
                  msg.type === 'error' && "bg-red-500/10 border border-red-500/20",
                  msg.type === 'success' && "bg-emerald-500/10 border border-emerald-500/20",
                  msg.type === 'hint' && "bg-[var(--td-accent-ai-muted)] border border-[var(--td-accent-ai)]/20",
                  msg.type === 'info' && "bg-[var(--td-surface-elevated)] border border-[var(--td-border)]"
                )}
              >
                <div className="flex items-start gap-2">
                  {msg.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  {msg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />}
                  {msg.type === 'hint' && <Lightbulb className="w-4 h-4 text-[var(--td-accent-ai)] mt-0.5 flex-shrink-0" />}
                  {msg.type === 'info' && <MessageSquare className="w-4 h-4 text-[var(--td-text-tertiary)] mt-0.5 flex-shrink-0" />}
                  
                  <div className="flex-1">
                    <p className={cn(
                      "leading-relaxed",
                      msg.type === 'error' && "text-red-300",
                      msg.type === 'success' && "text-emerald-300",
                      msg.type === 'hint' && "text-[var(--td-text-primary)]",
                      msg.type === 'info' && "text-[var(--td-text-secondary)]"
                    )}>
                      {msg.content}
                    </p>
                    
                    {msg.codeSnippet && (
                      <pre className="mt-2 p-2 rounded bg-[var(--td-bg-secondary)] font-mono text-xs text-[var(--td-text-secondary)] overflow-x-auto">
                        {msg.codeSnippet}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--td-primary-muted)] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[var(--td-primary)]" />
              </div>
              <div className="bg-[var(--td-surface-elevated)] border border-[var(--td-border)] rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--td-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--td-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--td-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        </ScrollArea>

        <div
          className={cn(
            'pointer-events-none absolute top-0 left-0 right-3 h-6 bg-gradient-to-b from-[var(--td-surface)] to-transparent transition-opacity',
            showTopShadow ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute bottom-0 left-0 right-3 h-6 bg-gradient-to-t from-[var(--td-surface)] to-transparent transition-opacity',
            showBottomShadow ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--td-border)]">
        <div className="flex gap-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Posez une question..."
            className="flex-1 bg-[var(--td-bg-secondary)] border-[var(--td-border)] text-sm"
          />
          <Button 
            size="icon"
            onClick={handleSendMessage}
            disabled={!userInput.trim()}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-[var(--td-text-tertiary)] mt-2 text-center">
          L'agent ne donne jamais la réponse directement - il guide vers la solution
        </p>
      </div>
    </div>
  );
});

AgentMentor.displayName = 'AgentMentor';

export default AgentMentor;
