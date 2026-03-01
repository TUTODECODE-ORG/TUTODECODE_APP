// ============================================
// TutoDeCode Pro - Agent Terminal Bridge Hook
// Lie le terminal à l'analyse IA en temps réel
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TerminalOutput, AIMessage, Ticket } from '@/types';

interface UseAgentTerminalBridgeReturn {
  messages: AIMessage[];
  isAnalyzing: boolean;
  lastAnalysis: string | null;
  analyzeOutput: (output: string, context?: AnalysisContext) => void;
  requestHint: (errorType: ErrorType, context?: AnalysisContext) => void;
  clearMessages: () => void;
  getContextualHint: (terminalHistory: TerminalOutput[], currentTicket?: Ticket) => string | null;
}

interface AnalysisContext {
  currentTicket?: Ticket;
  checkpointId?: string;
  expectedOutput?: string;
}

export type ErrorType = 
  | 'permission-denied'
  | 'command-not-found'
  | 'syntax-error'
  | 'connection-refused'
  | 'timeout'
  | 'file-not-found'
  | 'unknown';

// Patterns de détection d'erreurs
const ERROR_PATTERNS: { type: ErrorType; patterns: RegExp[]; hint: string }[] = [
  {
    type: 'permission-denied',
    patterns: [
      /permission denied/i,
      /access denied/i,
      /operation not permitted/i,
      /eacces/i,
    ],
    hint: 'Je vois une erreur de permission. Quel outil Linux permet d\'élever les privilèges ? Pense à "sudo" ou à vérifier les permissions avec "ls -la".',
  },
  {
    type: 'command-not-found',
    patterns: [
      /command not found/i,
      /is not recognized/i,
      /unknown command/i,
    ],
    hint: 'Cette commande n\'est pas reconnue. Es-tu sûr qu\'elle est installée ? Tu peux vérifier avec "which <command>" ou l\'installer avec ton gestionnaire de paquets.',
  },
  {
    type: 'syntax-error',
    patterns: [
      /syntax error/i,
      /unexpected token/i,
      /parse error/i,
      /invalid syntax/i,
    ],
    hint: 'Il y a une erreur de syntaxe. Vérifie les parenthèses, les guillemets et les points-virgules. Un éditeur avec coloration syntaxique peut t\'aider !',
  },
  {
    type: 'connection-refused',
    patterns: [
      /connection refused/i,
      /econnrefused/i,
      /unable to connect/i,
    ],
    hint: 'La connexion a été refusée. Le service est-il démarré ? Vérifie avec "systemctl status <service>" ou "docker ps".',
  },
  {
    type: 'timeout',
    patterns: [
      /timeout/i,
      /etimedout/i,
      /connection timed out/i,
    ],
    hint: 'La connexion a expiré. Vérifie ton pare-feu et assure-toi que le port est correctement ouvert.',
  },
  {
    type: 'file-not-found',
    patterns: [
      /no such file or directory/i,
      /file not found/i,
      /enoent/i,
    ],
    hint: 'Le fichier n\'existe pas à cet emplacement. Vérifie le chemin avec "pwd" et "ls".',
  },
];

// Messages d'encouragement
const ENCOURAGEMENTS = [
  'Bien joué ! Continue comme ça.',
  'Excellent travail ! Tu progresses bien.',
  'Parfait ! Tu maîtrises ce concept.',
  'Bravo ! C\'est exactement ça.',
  'Super ! Passons au prochain checkpoint.',
];

// Indices contextuels par catégorie de ticket
const CONTEXTUAL_HINTS: Record<string, string[]> = {
  devops: [
    'Pense à vérifier les logs avec "docker logs" ou "kubectl logs".',
    'Les fichiers de configuration sont souvent dans /etc/ ou ~/.config/',
    'Utilise "netstat -tlnp" pour voir les ports en écoute.',
  ],
  security: [
    'Vérifie les permissions avec "ls -la" et "stat".',
    'Les fichiers sensibles ne devraient pas être lisibles par tout le monde.',
    'Pense à utiliser "chmod" et "chown" correctement.',
  ],
  frontend: [
    'Vérifie la console du navigateur pour les erreurs JavaScript.',
    'Les outils de développement (F12) sont tes amis.',
    'Pense à vider le cache et faire un hard refresh.',
  ],
  backend: [
    'Vérifie que le serveur écoute sur le bon port.',
    'Les logs d\'erreur sont souvent dans /var/log/.',
    'Utilise "curl" ou "postman" pour tester tes endpoints.',
  ],
  database: [
    'Vérifie la connexion avec "ping" ou "telnet".',
    'Les credentials sont-ils corrects dans le fichier de config ?',
    'Utilise "EXPLAIN" pour analyser les requêtes lentes.',
  ],
  cloud: [
    'Vérifie tes credentials AWS/Azure/GCP.',
    'Les IAM policies peuvent bloquer certaines actions.',
    'Utilise le CLI cloud pour déboguer plus facilement.',
  ],
};

export function useAgentTerminalBridge(): UseAgentTerminalBridgeReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const analysisTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Détecte le type d'erreur dans la sortie
  const detectErrorType = useCallback((output: string): ErrorType | null => {
    for (const { type, patterns } of ERROR_PATTERNS) {
      if (patterns.some(pattern => pattern.test(output))) {
        return type;
      }
    }
    return null;
  }, []);

  // Obtient un indice pour un type d'erreur
  const getHintForError = useCallback((errorType: ErrorType): string => {
    const error = ERROR_PATTERNS.find(e => e.type === errorType);
    return error?.hint || 'Je détecte une erreur. Analysons-la ensemble...';
  }, []);

  // Analyse la sortie du terminal
  const analyzeOutput = useCallback((output: string, context?: AnalysisContext) => {
    // Annule l'analyse précédente si elle est en cours
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    setIsAnalyzing(true);

    // Débounce l'analyse pour ne pas spammer
    analysisTimeoutRef.current = setTimeout(() => {
      const errorType = detectErrorType(output);
      
      if (errorType) {
        const hint = getHintForError(errorType);
        const message: AIMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: hint,
          timestamp: Date.now(),
          metadata: {
            type: 'hint',
            relatedCheckpoint: context?.checkpointId,
          },
        };
        
        setMessages(prev => [...prev, message]);
        setLastAnalysis('error-detected');
      } else if (output.includes('success') || output.includes('done') || output.includes('complete')) {
        // Détecte un succès
        const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        const message: AIMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: encouragement,
          timestamp: Date.now(),
          metadata: {
            type: 'success',
            relatedCheckpoint: context?.checkpointId,
          },
        };
        
        setMessages(prev => [...prev, message]);
        setLastAnalysis('success-detected');
      }

      setIsAnalyzing(false);
    }, 500);
  }, [detectErrorType, getHintForError]);

  // Demande un indice explicite
  const requestHint = useCallback((errorType: ErrorType, context?: AnalysisContext) => {
    const hint = getHintForError(errorType);
    
    // Ajoute un contexte supplémentaire si un ticket est en cours
    let fullHint = hint;
    if (context?.currentTicket) {
      const categoryHints = CONTEXTUAL_HINTS[context.currentTicket.category];
      if (categoryHints && categoryHints.length > 0) {
        const randomHint = categoryHints[Math.floor(Math.random() * categoryHints.length)];
        fullHint = `${hint}\n\n💡 **Astuce ${context.currentTicket.category}**: ${randomHint}`;
      }
    }

    const message: AIMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: fullHint,
      timestamp: Date.now(),
      metadata: {
        type: 'hint',
        relatedCheckpoint: context?.checkpointId,
      },
    };

    setMessages(prev => [...prev, message]);
  }, [getHintForError]);

  // Obtient un indice contextuel basé sur l'historique
  const getContextualHint = useCallback((
    terminalHistory: TerminalOutput[],
    currentTicket?: Ticket
  ): string | null => {
    if (terminalHistory.length === 0) return null;

    // Analyse les dernières commandes
    const recentOutputs = terminalHistory.slice(-5);
    const hasErrors = recentOutputs.some(o => o.type === 'error');
    const hasSuccess = recentOutputs.some(o => 
      o.content.includes('success') || o.content.includes('done')
    );

    if (hasErrors) {
      const lastError = recentOutputs.find(o => o.type === 'error');
      if (lastError) {
        const errorType = detectErrorType(lastError.content);
        if (errorType) {
          return getHintForError(errorType);
        }
      }
    }

    // Si aucune erreur mais ticket en cours, donne un indice contextuel
    if (currentTicket && !hasSuccess) {
      const categoryHints = CONTEXTUAL_HINTS[currentTicket.category];
      if (categoryHints && categoryHints.length > 0) {
        return categoryHints[Math.floor(Math.random() * categoryHints.length)];
      }
    }

    return null;
  }, [detectErrorType, getHintForError]);

  // Efface les messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastAnalysis(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isAnalyzing,
    lastAnalysis,
    analyzeOutput,
    requestHint,
    clearMessages,
    getContextualHint,
  };
}
