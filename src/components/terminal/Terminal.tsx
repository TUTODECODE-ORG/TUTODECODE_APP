// ============================================
// TutoDeCode - Terminal Component
// Terminal intégré avec Xterm.js
// ============================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { 
  Terminal as TerminalIcon, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Copy,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  isDesktop?: boolean;
  className?: string;
}

export function Terminal({ isDesktop = false, className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Initialise le terminal Xterm.js
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
    });

    // Addons
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    // Monte le terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    // Gestionnaire d'entrée
    let currentLine = '';
    term.onData((data: string) => {
      const code = data.charCodeAt(0);

      // Enter
      if (code === 13) {
        term.writeln('');
        handleCommand(currentLine, term);
        currentLine = '';
      }
      // Backspace
      else if (code === 127) {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Caractères imprimables
      else if (code >= 32 && code < 127) {
        currentLine += data;
        term.write(data);
      }
    });

    xtermRef.current = term;

    // Message de bienvenue
    term.writeln('\x1b[1;34m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;34m║\x1b[0m  \x1b[1;36mTutoDeCode\x1b[0m - Terminal Intégré                      \x1b[1;34m║\x1b[0m');
    term.writeln('\x1b[1;34m║\x1b[0m                                                              \x1b[1;34m║\x1b[0m');
    term.writeln('\x1b[1;34m║\x1b[0m  \x1b[90mTapez \x1b[33mhelp\x1b[90m pour voir les commandes disponibles\x1b[0m          \x1b[1;34m║\x1b[0m');
    term.writeln('\x1b[1;34m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    writePrompt(term);

    // Redimensionnement
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  // Écrit le prompt
  const writePrompt = (term: XTerm) => {
    term.write('\x1b[1;32m➜\x1b[0m \x1b[1;34m~/tutodecode\x1b[0m \x1b[90m(main)\x1b[0m ');
  };

  // Gère les commandes
  const handleCommand = useCallback((command: string, term: XTerm) => {
    const trimmedCommand = command.trim();
    
    if (!trimmedCommand) {
      writePrompt(term);
      return;
    }

    // Commandes intégrées
    const args = trimmedCommand.split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'help':
        term.writeln('\x1b[1;36mCommandes disponibles:\x1b[0m');
        term.writeln('  \x1b[33mclear\x1b[0m      - Efface le terminal');
        term.writeln('  \x1b[33mhelp\x1b[0m       - Affiche cette aide');
        term.writeln('  \x1b[33mwhoami\x1b[0m     - Affiche l\'utilisateur');
        term.writeln('  \x1b[33mdate\x1b[0m       - Affiche la date');
        term.writeln('  \x1b[33mecho\x1b[0m       - Affiche un message');
        term.writeln('  \x1b[33mls\x1b[0m         - Liste les fichiers');
        term.writeln('  \x1b[33mpwd\x1b[0m        - Affiche le répertoire courant');
        break;

      case 'clear':
        term.clear();
        break;

      case 'whoami':
        term.writeln('developer');
        break;

      case 'date':
        term.writeln(new Date().toLocaleString('fr-FR'));
        break;

      case 'echo':
        term.writeln(args.slice(1).join(' '));
        break;

      case 'ls':
        term.writeln('\x1b[1;34mdocuments\x1b[0m  \x1b[1;34mprojects\x1b[0m  \x1b[1;34mtutorials\x1b[0m  readme.md');
        break;

      case 'pwd':
        term.writeln('/home/developer/tutodecode');
        break;

      default:
        term.writeln(`\x1b[31mCommande non trouvée: ${cmd}\x1b[0m`);
        term.writeln('\x1b[90mTapez "help" pour voir les commandes disponibles\x1b[0m');
    }

    writePrompt(term);
  }, []);

  // Copie le contenu du terminal
  const copyTerminal = () => {
    const term = xtermRef.current;
    if (!term) return;
    
    const selection = term.getSelection();
    if (selection) {
      navigator.clipboard.writeText(selection);
    }
  };

  // Efface le terminal
  const clearTerminal = () => {
    const term = xtermRef.current;
    if (term) {
      term.clear();
      writePrompt(term);
    }
  };

  return (
    <div className={`terminal flex flex-col ${isMaximized ? 'fixed inset-0 z-50' : ''} ${className}`}>
      {/* Header */}
      <div className="terminal-header">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-[var(--td-primary)]" />
          <span className="text-sm font-medium">Terminal</span>
          {!isDesktop && (
            <span className="text-xs text-[var(--td-accent-ai)] animate-pulse">
              (WebContainer)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={copyTerminal}
            title="Copier la sélection"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={clearTerminal}
            title="Effacer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Réduire' : 'Agrandir'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
          
          {isMaximized && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => setIsMaximized(false)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Terminal body */}
      <div 
        ref={terminalRef} 
        className="terminal-body flex-1"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}
