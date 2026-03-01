import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Terminal, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types pour le système de fichiers simulé
interface VirtualFile {
    name: string;
    type: 'file' | 'dir';
    content?: string;
    children?: VirtualFile[];
}

interface WebShellProps {
    initialPath?: string;
    validCommands?: string[]; // Commandes suggérées/attendues pour l'exercice
    fileSystem?: VirtualFile[];
    onSuccess?: (command: string) => void; // Callback quand une "bonne" commande est tapée
    className?: string;
}

export interface WebShellRef {
    typeAndExecuteCommand: (command: string) => Promise<void>;
}

const DEFAULT_FS: VirtualFile[] = [
    {
        name: 'app', type: 'dir', children: [
            { name: 'main.py', type: 'file', content: 'print("Hello World")' },
            { name: 'requirements.txt', type: 'file', content: 'flask\npandas' },
            { name: 'Dockerfile', type: 'file', content: 'FROM python:3.9\nCOPY . /app' },
        ]
    },
    { name: 'config.json', type: 'file', content: '{}' },
    { name: 'readme.md', type: 'file', content: '# Demo Project' },
];

export const WebShell = forwardRef<WebShellRef, WebShellProps>(({
    initialPath = '/root',
    validCommands = [],
    onSuccess,
    className
}, ref) => {
    const [history, setHistory] = useState<Array<{ cmd: string, output: string | React.ReactNode }>>([
        { cmd: '', output: 'Welcome to Ghost Framework Shell v1.0. Type "help" for commands.' }
    ]);
    const [currentInput, setCurrentInput] = useState('');
    const [cwd] = useState(initialPath);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    // Focus input on click
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    const executeCommand = (cmdStr: string) => {
        const args = cmdStr.trim().split(' ');
        const cmd = args[0].toLowerCase();
        const rest = args.slice(1).join(' '); // Reste de la commande
        let output: string | React.ReactNode = '';

        // Logique de commande basique
        switch (cmd) {
            case 'help':
                output = (
                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                        <span className="text-green-400">ls</span><span>Lister fichiers</span>
                        <span className="text-green-400">cd [dir]</span><span>Changer dossier</span>
                        <span className="text-green-400">cat [file]</span><span>Lire fichier</span>
                        <span className="text-green-400">pwd</span><span>Chemin actuel</span>
                        <span className="text-green-400">clear</span><span>Effacer écran</span>
                        <span className="text-green-400">echo [msg]</span><span>Afficher message</span>
                        {validCommands.length > 0 && (
                            <>
                                <div className="col-span-2 mt-2 text-yellow-500 font-bold border-b border-yellow-500/30 pb-1">Commandes Exercice:</div>
                                {validCommands.map(c => (
                                    <React.Fragment key={c}>
                                        <span className="text-yellow-300">{c}</span><span>Commande requise</span>
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </div>
                );
                break;

            case 'ls':
                // Pour la démo, on liste juste le FS racine ou filtré
                // Idéalement, il faudrait parcourir récursivement le FS selon cwd
                // Ici on triche un peu pour la démo visuelle
                output = (
                    <div className="flex flex-wrap gap-4">
                        {DEFAULT_FS.map(f => (
                            <span key={f.name} className={cn(f.type === 'dir' ? 'text-blue-400 font-bold' : 'text-slate-300')}>
                                {f.name}{f.type === 'dir' ? '/' : ''}
                            </span>
                        ))}
                    </div>
                );
                break;

            case 'pwd':
                output = cwd;
                break;

            case 'clear':
                setHistory([]);
                return;

            case 'echo':
                output = rest;
                break;

            case 'docker':
                if (rest.startsWith('ps')) {
                    output = (
                        <div className="whitespace-pre font-mono text-xs">
                            CONTAINER ID   IMAGE          COMMAND    CREATED          STATUS          PORTS
                            <br />
                            a1b2c3d4e5f6   nginx:latest   "nginx"    2 minutes ago    Up 2 minutes    80/tcp
                        </div>
                    );
                } else if (rest.startsWith('run')) {
                    output = `Unable to find image '${rest.split(' ')[1]}:latest' locally\nPulling from library...\nDigest: sha256:...\nStatus: Downloaded newer image\nRunning container...`;
                } else {
                    output = `Docker command executed: ${rest}`;
                }
                break;

            case 'git':
                if (rest === 'status') {
                    output = 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nworking tree clean';
                } else {
                    output = `Git command executed: ${rest}`;
                }
                break;

            default:
                if (cmd === '') {
                    output = '';
                } else {
                    output = `Command not found: ${cmd}`;
                }
        }

        // Vérifier si c'est une commande attendue pour l'exercice
        // On vérifie si la commande tapée commence par une des commandes valides
        const isSuccess = validCommands.some(vc => cmdStr.startsWith(vc));

        if (isSuccess && onSuccess) {
            onSuccess(cmdStr);
            output = (
                <div>
                    {output}
                    <div className="mt-2 text-green-400 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" /> Excellente commande !
                    </div>
                </div>
            );
        }

        setHistory(prev => [...prev, { cmd: cmdStr, output }]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            executeCommand(currentInput);
            setCurrentInput('');
        }
        // TODO: Arrow up history navigation
    };

    useImperativeHandle(ref, () => ({
        typeAndExecuteCommand: async (command: string) => {
            // Simuler la frappe clavier
            for (let i = 0; i <= command.length; i++) {
                setCurrentInput(command.substring(0, i));
                // Vitesse de frappe aléatoire pour faire naturel
                await new Promise(r => setTimeout(r, 30 + Math.random() * 50));
            }
            await new Promise(r => setTimeout(r, 200)); // Pause avant Entrée
            executeCommand(command);
            setCurrentInput('');
        }
    }));

    return (
        <Card className={cn("overflow-hidden border-slate-700 bg-[#0d1117] shadow-xl", className)}>
            {/* Terminal Title Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">bash — 80x24</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 hover:bg-red-500 border border-transparent hover:border-red-400 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 hover:bg-yellow-500 border border-transparent hover:border-yellow-400 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 hover:bg-green-500 border border-transparent hover:border-green-400 transition-colors" />
                </div>
            </div>

            {/* Terminal Output Area */}
            <div
                className="h-80 p-4 font-mono text-sm overflow-y-auto cursor-text"
                onClick={handleContainerClick}
                ref={scrollRef}
            >
                <div className="space-y-1">
                    {history.map((entry, i) => (
                        <div key={i}>
                            {entry.cmd && (
                                <div className="flex gap-2 text-slate-300">
                                    <span className="text-green-500 font-bold">user@ghost:~{cwd}$</span>
                                    <span>{entry.cmd}</span>
                                </div>
                            )}
                            <div className="text-slate-400 pl-0 break-words whitespace-pre-wrap">
                                {entry.output}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Line */}
                <div className="flex gap-2 mt-1">
                    <span className="text-green-500 font-bold shrink-0">user@ghost:~{cwd}$</span>
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent border-none outline-none text-slate-200 p-0 m-0 font-mono caret-slate-200"
                            autoFocus
                            spellCheck={false}
                            autoComplete="off"
                        />
                        {/* Blinking Cursor Simulation (optional, default caret works too) */}
                    </div>
                </div>
            </div>

            {/* Suggestions Bar (if valid commands passed) */}
            {validCommands.length > 0 && (
                <div className="px-2 py-1 bg-[#161b22] border-t border-slate-800 flex flex-wrap gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest py-1 px-2">Suggestions:</span>
                    {validCommands.map(cmd => (
                        <button
                            key={cmd}
                            onClick={() => setCurrentInput(cmd)}
                            className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 transition-colors font-mono"
                        >
                            {cmd}
                        </button>
                    ))}
                </div>
            )}
        </Card>
    );
});
