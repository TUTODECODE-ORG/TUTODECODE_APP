// ============================================
// TutoDeCode Pro - useTerminal Hook
// Terminal interactif avec xterm.js et bridge Tauri
// ============================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { invoke } from '@tauri-apps/api/core';

// ============================================
// TYPES
// ============================================
export interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}

export interface TerminalCommand {
  command: string;
  description: string;
  handler: (args: string[]) => Promise<string> | string;
}

export interface UseTerminalOptions {
  isDesktop?: boolean;
  onError?: (error: string) => void;
  onCommand?: (command: string, output: string) => void;
  customCommands?: Record<string, TerminalCommand>;
}

export interface UseTerminalReturn {
  terminalRef: React.RefObject<HTMLDivElement | null>;
  xterm: XTerm | null;
  isReady: boolean;
  isExecuting: boolean;
  output: TerminalOutput[];
  executeCommand: (command: string) => Promise<void>;
  clear: () => void;
  focus: () => void;
  fit: () => void;
}

// ============================================
// COMMANDES SIMULÉES POUR LE MODE WEB
// ============================================
const SIMULATED_COMMANDS: Record<string, TerminalCommand> = {
  help: {
    command: 'help',
    description: 'Affiche l\'aide',
    handler: () => `
╔══════════════════════════════════════════════════════════════╗
║                    COMMANDES DISPONIBLES                      ║
╠══════════════════════════════════════════════════════════════╣
║  help              Affiche cette aide                         ║
║  clear             Efface le terminal                         ║
║  echo <text>       Affiche du texte                           ║
║  pwd               Affiche le répertoire courant              ║
║  ls                Liste les fichiers                         ║
║  cat <file>        Affiche le contenu d\'un fichier           ║
║  cargo <cmd>       Commandes Cargo (simulé)                   ║
║  rustc <file>      Compile un fichier Rust (simulé)           ║
║  check             Vérifie l\'exercice actuel                  ║
║  hint              Demande un indice                          ║
╚══════════════════════════════════════════════════════════════╝
    `.trim()
  },
  
  clear: {
    command: 'clear',
    description: 'Efface le terminal',
    handler: () => '__CLEAR__'
  },
  
  echo: {
    command: 'echo',
    description: 'Affiche du texte',
    handler: (args) => args.join(' ')
  },
  
  pwd: {
    command: 'pwd',
    description: 'Répertoire courant',
    handler: () => '/home/developer/tutodecode'
  },
  
  ls: {
    command: 'ls',
    description: 'Liste les fichiers',
    handler: (args) => {
      if (args.includes('-la') || args.includes('-a')) {
        return `total 32
drwxr-xr-x 5 developer developer 4096 Jan 15 10:00 .
drwxr-xr-x 3 developer developer 4096 Jan 15 09:00 ..
-rw-r--r-- 1 developer developer  220 Jan 15 09:30 .bashrc
-rw-r--r-- 1 developer developer  891 Jan 15 09:30 Cargo.toml
drwxr-xr-x 2 developer developer 4096 Jan 15 10:00 src
drwxr-xr-x 2 developer developer 4096 Jan 15 09:45 target
-rw-r--r-- 1 developer developer  156 Jan 15 09:30 README.md`;
      }
      return 'Cargo.toml  src  target  README.md';
    }
  },
  
  cat: {
    command: 'cat',
    description: 'Affiche un fichier',
    handler: (args) => {
      const file = args[0];
      if (!file) return 'cat: missing file operand';
      
      const files: Record<string, string> = {
        'Cargo.toml': `[package]
name = "tutodecode-app"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2.0", features = [] }`,
        'README.md': '# TutoDeCode Pro\n\nVotre laboratoire DevOps interactif.',
        '.bashrc': '# ~/.bashrc\nexport PATH="$HOME/.cargo/bin:$PATH"'
      };
      
      return files[file] || `cat: ${file}: No such file or directory`;
    }
  },
  
  cargo: {
    command: 'cargo',
    description: 'Commandes Cargo',
    handler: (args) => {
      const subcmd = args[0];
      
      switch (subcmd) {
        case 'build':
          return `   Compiling tutodecode-app v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 2.34s`;
        
        case 'run':
          return `    Finished dev [unoptimized + debuginfo] target(s) in 1.89s
     Running \`target/debug/tutodecode-app\`
🚀 Tauri app started successfully!`;
        
        case 'check':
          return `    Checking tutodecode-app v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 0.45s`;
        
        case 'test':
          return `   Compiling tutodecode-app v0.1.0
    Finished test [unoptimized + debuginfo] target(s) in 3.21s
     Running unittests src/main.rs

test result: ok. 5 passed; 0 failed; 0 ignored`;
        
        case '--version':
        case '-V':
          return 'cargo 1.75.0';
        
        default:
          return `cargo ${subcmd || ''}
Cargo command executed successfully.`;
      }
    }
  },
  
  rustc: {
    command: 'rustc',
    description: 'Compilateur Rust',
    handler: (args) => {
      const file = args[0];
      if (!file) return 'error: no input filename given';
      if (!file.endsWith('.rs')) return `error: file '${file}' is not a Rust file`;
      
      return `Compiling ${file}...
error[E0425]: cannot find function 'main' in this scope
 --> ${file}:1:1
  |
1 | fn maain() {
  |    ^^^^^ help: a function with a similar name exists: 'main'

error: aborting due to previous error

For more information about this error, try 'rustc --explain E0425'.`;
    }
  },
  
  check: {
    command: 'check',
    description: 'Vérifie l\'exercice',
    handler: () => `🔍 Vérification de votre solution...

✅ Commande trouvée: #[tauri::command]
✅ Fonction correctement nommée
✅ Type de retour validé
✅ Paramètres corrects

🎉 Félicitations ! Votre solution est correcte.
Tapez 'next' pour passer au chapitre suivant.`
  },
  
  hint: {
    command: 'hint',
    description: 'Demande un indice',
    handler: () => `💡 Indice: Utilisez #[tauri::command] pour annoter votre fonction.

La syntaxe est:
  #[tauri::command]
  fn ma_fonction() -> String {
      "résultat".to_string()
  }`
  },
  
  invoke: {
    command: 'invoke',
    description: 'Appelle une commande Tauri',
    handler: (args) => {
      const cmd = args[0];
      if (cmd === 'hello_tauri') {
        return 'Tauri v3 est opérationnel !';
      }
      if (cmd === 'test_counter') {
        return 'count: 3';
      }
      if (cmd === 'test_task_api') {
        return 'task_created: true, task_toggled: true';
      }
      return `Command '${cmd}' invoked successfully.`;
    }
  },
  
  test_counter: {
    command: 'test_counter',
    description: 'Teste le compteur',
    handler: () => 'count: 3'
  },
  
  test_task_api: {
    command: 'test_task_api',
    description: 'Teste l\'API de tâches',
    handler: () => 'task_created: true, task_toggled: true'
  },
  
  test_security: {
    command: 'test_security',
    description: 'Teste la sécurité',
    handler: () => 'security_passed: true'
  },
  
  test_state: {
    command: 'test_state',
    description: 'Teste le state',
    handler: () => 'stats: { requests: 10, errors: 0 }'
  },
  
  test_async: {
    command: 'test_async',
    description: 'Teste async',
    handler: () => 'HELLO WORLD'
  },
  
  test_atomic_write: {
    command: 'test_atomic_write',
    description: 'Teste écriture atomique',
    handler: () => 'atomic_write: success'
  },
  
  test_process: {
    command: 'test_process',
    description: 'Teste processus',
    handler: () => 'exit_code: 0'
  },
  
  test_http: {
    command: 'test_http',
    description: 'Teste HTTP',
    handler: () => '{"status": "ok"}'
  },
  
  test_telemetry: {
    command: 'test_telemetry',
    description: 'Teste télémétrie',
    handler: () => 'error_rate: 0.5'
  }
};

// ============================================
// HOOK PRINCIPAL
// ============================================
export function useTerminal(options: UseTerminalOptions = {}): UseTerminalReturn {
  const { 
    isDesktop = false, 
    onError, 
    onCommand,
    customCommands = {} 
  } = options;
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const ptyIdRef = useRef<string | null>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<TerminalOutput[]>([]);

  // Commandes disponibles
  const commands = { ...SIMULATED_COMMANDS, ...customCommands };

  // ============================================
  // AJOUT DE SORTIE
  // ============================================
  const addOutput = useCallback((type: TerminalOutput['type'], content: string) => {
    const newOutput: TerminalOutput = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: Date.now()
    };
    setOutput(prev => [...prev, newOutput]);
    
    // Écrit aussi dans xterm
    if (xtermRef.current) {
      if (type === 'input') {
        xtermRef.current.writeln(`\x1b[1;32m➜\x1b[0m ${content}`);
      } else if (type === 'error') {
        xtermRef.current.writeln(`\x1b[31m${content}\x1b[0m`);
      } else if (type === 'system') {
        xtermRef.current.writeln(`\x1b[33m${content}\x1b[0m`);
      } else {
        xtermRef.current.writeln(content);
      }
    }
  }, []);

  // ============================================
  // EXÉCUTION DE COMMANDE
  // ============================================
  const executeCommand = useCallback(async (input: string) => {
    if (!input.trim() || isExecuting) return;
    
    setIsExecuting(true);
    addOutput('input', input);
    
    try {
      let result: string;
      
      if (isDesktop && ptyIdRef.current) {
        // Mode Desktop: utilise le PTY natif via Tauri
        try {
          await invoke('pty_write', { data: input + '\n' });
          // La sortie sera lue par le listener
          result = '';
        } catch (e) {
          result = `Error: ${e}`;
        }
      } else {
        // Mode Web: commandes simulées
        const parts = input.trim().split(' ');
        const cmdName = parts[0];
        const args = parts.slice(1);
        
        const cmd = commands[cmdName];
        
        if (cmd) {
          const output = await cmd.handler(args);
          
          if (output === '__CLEAR__') {
            xtermRef.current?.clear();
            result = '';
          } else {
            result = output;
          }
        } else if (cmdName) {
          result = `\x1b[31mCommand not found: ${cmdName}\x1b[0m\nType 'help' for available commands.`;
        } else {
          result = '';
        }
      }
      
      if (result) {
        addOutput('output', result);
      }
      
      onCommand?.(input, result);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addOutput('error', errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsExecuting(false);
      // Réaffiche le prompt
      if (xtermRef.current && !isDesktop) {
        xtermRef.current.write('\x1b[1;32m➜\x1b[0m \x1b[1;34m~/tutodecode\x1b[0m \x1b[90m(main)\x1b[0m ');
      }
    }
  }, [isDesktop, isExecuting, commands, addOutput, onCommand, onError]);

  // ============================================
  // INITIALISATION DU TERMINAL
  // ============================================
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
      theme: {
        background: '#0A0C12',
        foreground: '#F0F6FC',
        cursor: '#6366F1',
        selectionBackground: 'rgba(99, 102, 241, 0.3)',
        black: '#0A0C12',
        red: '#EF4444',
        green: '#10B981',
        yellow: '#F59E0B',
        blue: '#6366F1',
        magenta: '#A855F7',
        cyan: '#06B6D4',
        white: '#F0F6FC',
        brightBlack: '#484F58',
        brightRed: '#F87171',
        brightGreen: '#34D399',
        brightYellow: '#FBBF24',
        brightBlue: '#818CF8',
        brightMagenta: '#C084FC',
        brightCyan: '#22D3EE',
        brightWhite: '#FFFFFF',
      },
      scrollback: 10000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    // Gestionnaire d'entrée
    let currentLine = '';
    term.onData((data: string) => {
      const code = data.charCodeAt(0);

      if (code === 13) { // Enter
        term.writeln('');
        executeCommand(currentLine);
        currentLine = '';
      } else if (code === 127) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code === 3) { // Ctrl+C
        term.write('^C\r\n');
        currentLine = '';
        term.write('\x1b[1;32m➜\x1b[0m \x1b[1;34m~/tutodecode\x1b[0m \x1b[90m(main)\x1b[0m ');
      } else if (code >= 32 && code < 127) {
        currentLine += data;
        term.write(data);
      }
    });

    xtermRef.current = term;
    setIsReady(true);

    // Message de bienvenue
    term.writeln('\x1b[1;34m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;34m║\x1b[0m  \x1b[1;36mTutoDeCode Pro\x1b[0m - Terminal Intégré                      \x1b[1;34m║\x1b[0m');
    term.writeln('\x1b[1;34m║\x1b[0m                                                              \x1b[1;34m║\x1b[0m');
    term.writeln('\x1b[1;34m║\x1b[0m  \x1b[90mTapez \x1b[33mhelp\x1b[90m pour voir les commandes disponibles\x1b[0m          \x1b[1;34m║\x1b[0m');
    term.writeln('\x1b[1;34m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.write('\x1b[1;32m➜\x1b[0m \x1b[1;34m~/tutodecode\x1b[0m \x1b[90m(main)\x1b[0m ');

    // Initialisation PTY si desktop
    if (isDesktop) {
      invoke('pty_create', { cols: 80, rows: 24 })
        .then((id: unknown) => {
          ptyIdRef.current = id as string;
          addOutput('system', 'PTY natif initialisé');
        })
        .catch((e) => {
          addOutput('error', `Erreur PTY: ${e}`);
        });
    }

    // Redimensionnement
    const handleResize = () => {
      fitAddon.fit();
      if (isDesktop && ptyIdRef.current) {
        const dims = fitAddon.proposeDimensions();
        if (dims) {
          invoke('pty_resize', { cols: dims.cols, rows: dims.rows });
        }
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (isDesktop && ptyIdRef.current) {
        invoke('pty_destroy');
      }
      
      term.dispose();
      xtermRef.current = null;
    };
  }, [isDesktop, executeCommand, addOutput]);

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================
  const clear = useCallback(() => {
    xtermRef.current?.clear();
    setOutput([]);
    xtermRef.current?.write('\x1b[1;32m➜\x1b[0m \x1b[1;34m~/tutodecode\x1b[0m \x1b[90m(main)\x1b[0m ');
  }, []);

  const focus = useCallback(() => {
    xtermRef.current?.focus();
  }, []);

  const fit = useCallback(() => {
    fitAddonRef.current?.fit();
  }, []);

  return {
    terminalRef,
    xterm: xtermRef.current,
    isReady,
    isExecuting,
    output,
    executeCommand,
    clear,
    focus,
    fit
  };
}

export default useTerminal;
