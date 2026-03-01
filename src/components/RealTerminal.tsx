import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as TerminalIcon, WifiOff, RefreshCcw } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';
import { Button } from './ui/button';

// Mock pour Tauri IPC si on n'est pas dans l'environnement Desktop
// Normalement on importerait : import { invoke } from '@tauri-apps/api/core';
// et import { listen } from '@tauri-apps/api/event';
let tauriInvoke: any = null;
let tauriListen: any = null;
try {
    // Optionnel: Essayer de charger les vrais modules Tauri s'ils sont dispo
    // tauriInvoke = require('@tauri-apps/api/core').invoke;
    // tauriListen = require('@tauri-apps/api/event').listen;
} catch (e) { }

interface RealTerminalProps {
    className?: string;
    onData?: (data: string) => void;
}

export function RealTerminal({ className, onData }: RealTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // 1. Initialiser xterm.js avec un thème Pro (Sérénité)
        const term = new Terminal({
            cursorBlink: true,
            fontFamily: '"JetBrains Mono", Consolas, monospace',
            fontSize: 14,
            theme: {
                background: '#0d1117', // Github Dark / Linear bg
                foreground: '#c9d1d9',
                cursor: '#f59e0b', // Accent Amber pour le curseur
                selectionBackground: 'rgba(99, 102, 241, 0.3)', // Indigo
            }
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        let unlisten: (() => void) | null = null;

        const setupPty = async () => {
            try {
                if (tauriInvoke && tauriListen) {
                    // ==============================
                    // LOGIQUE REELLE TAURI (Desktop)
                    // ==============================

                    // Demander à Rust d'instancier un PTY
                    await tauriInvoke('spawn_pty');
                    setIsConnected(true);

                    // Écouter les sorties texte venant de Rust (le vrai terminal)
                    unlisten = await tauriListen('pty-stdout', (event: { payload: string }) => {
                        term.write(event.payload);
                        if (onData) onData(event.payload);
                    });

                    // Quand l'utilisateur tape dans xterm.js, envoyer à Rust
                    term.onData(async (data) => {
                        await tauriInvoke('write_pty', { data });
                    });

                    // Redimensionner le PTY côté Rust quand le frontend change de taille
                    term.onResize(async (size) => {
                        await tauriInvoke('resize_pty', { cols: size.cols, rows: size.rows });
                    });

                } else {
                    // ==============================
                    // LOGIQUE MOCK (Simulation Web)
                    // ==============================
                    setIsConnected(false); // Faux pour montrer qu'on est en Web sans WebContainers
                    term.writeln('\x1b[1;33m[Système]\x1b[0m Le backend natif (Tauri/PTY) n\'est pas détecté.');
                    term.writeln('\x1b[1;34m[Info]\x1b[0m Mode Fallback WebContainer activé (Simulé).');
                    term.writeln('user@tutodecode-pro:~$ ');

                    term.onData((data) => {
                        // Echo local très simple pour la forme
                        if (data === '\r') {
                            term.writeln('');
                            term.write('user@tutodecode-pro:~$ ');
                        } else if (data === '\x7f') { // Backspace
                            term.write('\b \b');
                        } else {
                            term.write(data);
                            if (onData) onData(data); // Envoyer au Bridge de l'IA
                        }
                    });
                }
            } catch (err) {
                console.error('PTY Setup Error:', err);
                term.writeln('\x1b[31mErreur de connexion au PTY natif.\x1b[0m');
                setIsConnected(false);
            }
        };

        setupPty();

        const handleResize = () => {
            fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
            if (unlisten) unlisten();
        };
    }, [onData]);

    return (
        <div className={`flex flex-col h-full bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
            {/* Barre d'état du Terminal */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#161B22] border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-medium text-slate-300 font-mono tracking-wide">
                        {isConnected === true ? "sys://pty/bash" : "sys://webcontainer/simulated"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {isConnected === true ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                            <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Native Connected</span>
                        </div>
                    ) : isConnected === false ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20" title="Mode Web. Le PTY Natif n'est dispo qu'en Desktop.">
                            <WifiOff className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] text-amber-500 font-bold tracking-wider uppercase">Web Fallback</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20">
                            <RefreshCcw className="w-3 h-3 text-slate-400 animate-spin" />
                            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Connecting...</span>
                        </div>
                    )}

                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>
            </div>

            {/* Conteneur xterm.js */}
            <div className="flex-1 w-full p-2 relative">
                <div ref={terminalRef} className="absolute inset-2" />
            </div>
        </div>
    );
}
