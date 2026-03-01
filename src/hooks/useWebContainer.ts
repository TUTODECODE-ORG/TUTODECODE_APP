// ============================================
// TutoDeCode Pro - WebContainer Hook
// Environnement Node.js/Linux dans le navigateur
// ============================================

import { useState, useCallback, useEffect } from 'react';
import type { WebContainerState, TerminalOutput } from '@/types';

interface UseWebContainerReturn {
  state: WebContainerState;
  terminal: {
    output: TerminalOutput[];
    input: (command: string) => Promise<void>;
    clear: () => void;
  };
  boot: () => Promise<void>;
}

export function useWebContainer(): UseWebContainerReturn {
  const [state, setState] = useState<WebContainerState>({
    isBooting: false,
    isReady: false,
  });
  const [output, setOutput] = useState<TerminalOutput[]>([]);

  // Ajoute une sortie au terminal
  const addOutput = useCallback((type: TerminalOutput['type'], content: string) => {
    setOutput(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: Date.now(),
    }]);
  }, []);

  // Démarre le WebContainer (simulé pour l'instant)
  const boot = useCallback(async () => {
    if (state.isReady) return;

    setState({ isBooting: true, isReady: false });
    addOutput('system', '🚀 Démarrage de l\'environnement WebContainer...');

    try {
      // Simule le démarrage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setState({ isBooting: false, isReady: true });
      addOutput('system', '✅ Environnement prêt !');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState({ isBooting: false, isReady: false, error: errorMessage });
      addOutput('error', `❌ Erreur: ${errorMessage}`);
    }
  }, [state.isReady, addOutput]);

  // Envoie une commande au shell
  const input = useCallback(async (command: string) => {
    addOutput('input', `$ ${command}`);
    
    // Simule la réponse
    setTimeout(() => {
      addOutput('output', `Commande exécutée: ${command}`);
    }, 100);
  }, [addOutput]);

  // Efface le terminal
  const clear = useCallback(() => {
    setOutput([]);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      // Cleanup si nécessaire
    };
  }, []);

  return {
    state,
    terminal: {
      output,
      input,
      clear,
    },
    boot,
  };
}
