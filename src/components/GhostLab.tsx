import { useRef, useEffect, useState, useCallback } from 'react';
import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebContainer } from '@webcontainer/api';
import {
    Terminal as TerminalIcon,

    Shield,
    Lock,
    Send,
    Radio,
    Ghost,
    Copy,
    Zap,
    Eye,
    EyeOff,
    MessageSquare,

    TerminalSquare,
    Link2,
    MonitorIcon,
    AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';

import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatMessage {
    sender: 'me' | 'peer';
    text: string;
    timestamp: Date;
    type: 'text' | 'system' | 'cmd';
}

export function GhostLab() {
    // --- CONNECTIVITY STATE ---
    const [peerId, setPeerId] = useState<string>('');
    const [remotePeerId, setRemotePeerId] = useState<string>('');
    const [connection, setConnection] = useState<DataConnection | null>(null);
    const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'connecting' | 'connected' | 'error'>('generating');

    // --- UI STATE ---
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [logs, setLogs] = useState<{ msg: string, time: string }[]>([]);
    const [activeTab, setActiveTab] = useState<'terminal' | 'chat'>('terminal');
    const [showHackerOverlay, setShowHackerOverlay] = useState(false);
    const [isStealthMode, setIsStealthMode] = useState(false);
    const [codename, setCodename] = useState('');
    const [isRemoteTyping, setIsRemoteTyping] = useState(false);
    const [engineStatus, setEngineStatus] = useState<'offline' | 'booting' | 'online'>('offline');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- CODENAME GENERATOR ---
    useEffect(() => {
        const prefixes = ['NEON', 'SILVER', 'GHOST', 'SHADOW', 'CYBER', 'VOID', 'ALPHA', 'PHANTOM', 'ZERO', 'CRYPTO'];
        const suffixes = ['STRIKE', 'OPERATIVE', 'STALKER', 'WRAITH', 'BLADE', 'PULSE', 'VEIL', 'SHARD', 'AGENT', 'HUNTER'];
        const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
        setCodename(`${rand(prefixes)}_${rand(suffixes)}`);
    }, []);

    // Effect to send typing status
    useEffect(() => {
        if (!connection || !chatInput) {
            if (connection) connection.send({ type: 'typing', status: false });
            return;
        }

        connection.send({ type: 'typing', status: true });
        const timeout = setTimeout(() => {
            connection.send({ type: 'typing', status: false });
        }, 3000);

        return () => clearTimeout(timeout);
    }, [chatInput, connection]);

    // --- REFS ---
    const peerRef = useRef<Peer | null>(null);
    const termRef = useRef<HTMLDivElement>(null);
    const terminalInstance = useRef<Terminal | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const wcProcessRef = useRef<any>(null);

    // --- LOGGING ---
    const addLog = useCallback((msg: string) => {
        const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
        setLogs(prev => [...prev, { msg, time }].slice(-15));
    }, []);

    // --- PEER INITIALIZATION ---
    useEffect(() => {
        let isMounted = true;

        const initPeer = async () => {
            try {
                setStatus('generating');
                const peer = new Peer();

                peer.on('open', (id) => {
                    if (!isMounted) return;
                    setPeerId(id);
                    setStatus('ready');
                    addLog(`[GHOST_IDENTITY] Established as: ${id.substring(0, 8)}...`);
                });

                peer.on('connection', (conn) => {
                    if (!isMounted) return;
                    addLog(`[INCOMING] Request from host: ${conn.peer.substring(0, 8)}`);
                    setupPeerConnection(conn);
                });

                peer.on('error', (err) => {
                    if (!isMounted) return;
                    console.error("Peer Error:", err);
                    setStatus('error');
                    toast.error(`Protocole Error: ${err.type}`);
                });

                peerRef.current = peer;
            } catch (err) {
                console.error("PeerJS Init Error:", err);
            }
        };

        initPeer();

        return () => {
            isMounted = false;
            peerRef.current?.destroy();
        };
    }, [addLog]);

    // --- TERMINAL SETUP ---
    useEffect(() => {
        if (!termRef.current) return;

        const term = new Terminal({
            theme: {
                background: 'transparent',
                foreground: '#00F0FF', // Cyber Cyan
                cursor: '#FF00A0', // Neon Pink
                selectionBackground: 'rgba(0, 240, 255, 0.3)',
                black: '#09090B',
                red: '#FF0055',
                green: '#00FF41',
                yellow: '#FACC15',
                blue: '#3B82F6',
                magenta: '#FF00A0',
                cyan: '#00F0FF',
                white: '#F8FAFC'
            },
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            lineHeight: 1.2,
            cursorBlink: true,
            cursorStyle: 'underline',
            letterSpacing: 0.5,
            screenReaderMode: true
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(termRef.current);
        fitAddon.fit();

        term.writeln('\x1b[1;36m>> GHOST_PROTOCOL_V2.0 INITIALIZED\x1b[0m');
        term.writeln('\x1b[2;37m>> WAITING FOR P2P HOST ENGINE OR BOOT COMMAND...\x1b[0m');

        term.onData(data => {
            if (wcProcessRef.current) {
                // Host executing
                const writer = wcProcessRef.current.input.getWriter();
                writer.write(data);
                writer.releaseLock();
            } else if (connection && connection.open) {
                // Guest sending input to host
                connection.send({ type: 'term_in', data });
            } else {
                // Offline echo fallback
                if (data === '\r') {
                    term.write('\r\n\x1b[1;35mghost@offline:~\x1b[0m$ ');
                } else if (data === '\x7f') {
                    term.write('\b \b');
                } else {
                    term.write(data);
                }
            }
        });

        terminalInstance.current = term;

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            term.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [connection]);

    // --- CONNECTION SETUP ---
    const setupPeerConnection = (conn: DataConnection) => {
        setConnection(conn);
        setStatus('connected');
        addLog(`[SYNC] Fully synchronized with ${conn.peer.substring(0, 6)}`);

        conn.on('data', (payload: any) => {
            if (payload.type === 'term_out') {
                // Guest receiving output from Host
                terminalInstance.current?.write(payload.data);
            } else if (payload.type === 'term_in') {
                // Host receiving input from Guest
                if (wcProcessRef.current) {
                    const writer = wcProcessRef.current.input.getWriter();
                    writer.write(payload.data);
                    writer.releaseLock();
                }
            } else if (payload.type === 'chat') {
                setMessages(prev => [...prev, {
                    sender: 'peer',
                    text: payload.text,
                    timestamp: new Date(),
                    type: 'text'
                }]);
                if (activeTab !== 'chat') {
                    toast.info(`Message Ghost: ${payload.text.substring(0, 20)}...`);
                }
            } else if (payload.type === 'cmd') {
                handleRemoteCommand(payload.cmd);
            } else if (payload.type === 'typing') {
                setIsRemoteTyping(payload.status);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                if (payload.status) {
                    typingTimeoutRef.current = setTimeout(() => setIsRemoteTyping(false), 5000);
                }
            }
        });

        conn.on('close', () => {
            setStatus('ready');
            setConnection(null);
            addLog(`[OFFLINE] Connection signal lost.`);
            toast.error("Contact perdu avec le partenaire.");
        });
    };

    const handleRemoteCommand = (cmd: string) => {
        addLog(`[CMD] Remote execution: ${cmd}`);
        if (cmd === 'trigger_hacker_fx') {
            setShowHackerOverlay(true);
            setTimeout(() => setShowHackerOverlay(false), 3000);
        }
    };

    const connectToPartner = () => {
        if (!peerRef.current || !remotePeerId) return;

        setStatus('connecting');
        const conn = peerRef.current.connect(remotePeerId, {
            metadata: { name: 'GhostOperative' }
        });
        setupPeerConnection(conn);
    };

    const bootWebContainer = async () => {
        if (engineStatus !== 'offline') return;
        setEngineStatus('booting');
        try {
            const wc = await WebContainer.boot();
            const process = await wc.spawn('jsh');
            wcProcessRef.current = process;
            setEngineStatus('online');

            process.output.pipeTo(new WritableStream({
                write(data) {
                    terminalInstance.current?.write(data);
                    // Broadcast host output to any connected guest
                    if (peerRef.current) {
                        const conns = peerRef.current.connections;
                        Object.values(conns).forEach((peerCons: any) => {
                            peerCons.forEach((c: any) => c.send({ type: 'term_out', data }));
                        });
                    }
                }
            }));
            addLog('[ENGINE] Local WebContainer Booted');
        } catch (err: any) {
            setEngineStatus('offline');
            console.error(err);
            toast.error("Échec du démarrage de WebContainer.");
        }
    };

    const sendChatMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim() || !connection) return;

        connection.send({ type: 'chat', text: chatInput });
        setMessages(prev => [...prev, {
            sender: 'me',
            text: chatInput,
            timestamp: new Date(),
            type: 'text'
        }]);
        setChatInput('');
    };

    const sendHackerFx = () => {
        if (!connection) return;
        connection.send({ type: 'cmd', cmd: 'trigger_hacker_fx' });
        handleRemoteCommand('trigger_hacker_fx');
    };

    const copyMyId = () => {
        navigator.clipboard.writeText(peerId);
        toast.success("Identity Key copied to clipboard");
    };

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={cn(
            "h-full flex flex-col bg-[#020617] text-zinc-100 transition-all duration-700",
            isStealthMode ? "grayscale contrast-125" : ""
        )}>
            {/* --- HACKER FX OVERLAY --- */}
            <AnimatePresence>
                {showHackerOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] pointer-events-none bg-lime-500/10 flex items-center justify-center overflow-hidden"
                    >
                        <div className="text-[10px] sm:text-sm font-mono text-lime-400 whitespace-pre opacity-20">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ y: [0, 1000] }}
                                    transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    {Math.random() > 0.5 ? '010111010101101010' : '101010010101101101'}
                                </motion.div>
                            ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-lime-500/20 border border-lime-500 px-8 py-4 rounded-lg bg-black text-lime-400 font-bold tracking-[10px] uppercase shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                            >
                                SYSTEM_INJECTED
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- TOP BAR --- */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Ghost className={cn(
                            "w-8 h-8 transition-all duration-500",
                            status === 'connected' ? "text-indigo-400 drop-shadow-[0_0_8px_#00F0FF]" : "text-zinc-600"
                        )} />
                        {status === 'connected' && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo- to-purple-400">
                                P2P_GHOST_MODE_EXTENDED
                            </h2>
                            <Badge variant="outline" className="text-[10px] py-0 border-indigo-/30 text-indigo-400 bg-indigo-/5">
                                V2.4-PRO
                            </Badge>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-[2px]">
                            AGENT: <span className="text-indigo-400">{codename}</span> // {status === 'connected' ? `SYNC_ACTIVE // PARTNER: ${remotePeerId.substring(0, 6)}` : `IDLE // AWAITING_CONNECTION`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsStealthMode(!isStealthMode)}
                        className={cn("gap-2", isStealthMode ? "text-red-400" : "text-zinc-400")}
                    >
                        {isStealthMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span className="hidden sm:inline">Ghost Mode</span>
                    </Button>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <Button variant="outline" size="sm" onClick={copyMyId} className="hidden sm:flex gap-2 border-white/10 hover:bg-white/5">
                        <Copy className="w-3 h-3" />
                        ID
                    </Button>
                </div>
            </div>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* --- SIDEBAR: CONTROLS & LOGS --- */}
                <aside className="w-full lg:w-80 border-r border-white/5 bg-zinc-900/20 flex flex-col">

                    {/* CONNECTION PANEL */}
                    <div className="p-4 space-y-4 border-b border-white/5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Target ID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={remotePeerId}
                                    onChange={(e) => setRemotePeerId(e.target.value)}
                                    placeholder="Paste Partner ID..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-indigo-400 focus:border-indigo-/50 outline-none transition-all"
                                />
                                <Button
                                    size="sm"
                                    onClick={connectToPartner}
                                    disabled={!remotePeerId || status === 'connected' || status === 'connecting'}
                                    className="bg-indigo-500 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-/20"
                                >
                                    <Link2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        {status === 'connected' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => connection?.close()}
                                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                                <Zap className="w-3 h-3 mr-2" />
                                Terminate Uplink
                            </Button>
                        )}
                    </div>

                    {/* QUICK COMMANDS */}
                    <div className="p-4 space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Command Hub</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={bootWebContainer}
                                disabled={engineStatus !== 'offline'}
                                variant="outline"
                                size="sm"
                                className="col-span-2 text-[10px] border-indigo-/30 bg-indigo-/10 text-indigo-400 justify-start hover:text-indigo-400 hover:bg-indigo-/40 font-bold"
                            >
                                <TerminalIcon className="w-3 h-3 mr-2" />
                                {engineStatus === 'offline' ? 'Host WebContainer Engine' : engineStatus === 'booting' ? 'Booting...' : 'Engine Online (Host)'}
                            </Button>
                            <Button onClick={sendHackerFx} disabled={!connection} variant="outline" size="sm" className="text-[10px] border-white/5 bg-white/5 text-zinc-300 justify-start hover:text-indigo-400">
                                <AlertCircle className="w-3 h-3 mr-2" /> Visual Flash
                            </Button>
                            <Button variant="outline" size="sm" className="text-[10px] border-white/5 bg-white/5 text-zinc-300 justify-start hover:text-purple-400">
                                <Shield className="w-3 h-3 mr-2" /> Encrypt Msg
                            </Button>
                        </div>
                    </div>

                    {/* CONSOLE LOGS */}
                    <div className="flex-1 p-4 flex flex-col min-h-[150px]">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-2">Internal Log</label>
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 font-mono text-[10px] space-y-1.5 overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-zinc-600">[{log.time}]</span>
                                    <span className="text-zinc-400 break-all">{log.msg}</span>
                                </div>
                            ))}
                            {logs.length === 0 && <span className="text-zinc-700 italic">No events recorded.</span>}
                        </div>
                    </div>
                </aside>

                {/* --- CENTER: TABS WORKSPACE --- */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#020617]/50">
                    <div className="flex border-b border-white/5 px-4 bg-zinc-900/40">
                        <button
                            onClick={() => setActiveTab('terminal')}
                            className={cn(
                                "px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all relative",
                                activeTab === 'terminal' ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <TerminalSquare className="w-4 h-4" />
                                Terminal
                            </div>
                            {activeTab === 'terminal' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_#00F0FF]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={cn(
                                "px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all relative",
                                activeTab === 'chat' ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Ghost Chat
                            </div>
                            {activeTab === 'chat' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-400 shadow-[0_0_10px_#A855F7]" />}
                        </button>
                    </div>

                    <div className="flex-1 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === 'terminal' ? (
                                <motion.div
                                    key="terminal"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="absolute inset-0 p-4"
                                >
                                    <div className="h-full w-full bg-black/60 rounded-xl border border-white/10 shadow-inner group relative">
                                        <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-900/50 rounded-t-xl border-b border-white/5 flex items-center px-4 justify-between">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                                <MonitorIcon className="w-3 h-3" />
                                                <span>tty.shard.ghost.1</span>
                                            </div>
                                        </div>
                                        <div className="pt-8 h-full p-2 overflow-hidden">
                                            <div ref={termRef} className="h-full w-full" />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chat"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="absolute inset-0 flex flex-col p-4"
                                >
                                    <div className="flex-1 bg-black/40 rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {messages.map((m, i) => (
                                                <div key={i} className={cn(
                                                    "flex flex-col",
                                                    m.sender === 'me' ? "items-end" : "items-start"
                                                )}>
                                                    <div className={cn(
                                                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                                        m.sender === 'me'
                                                            ? "bg-purple-600 text-white rounded-tr-none"
                                                            : "bg-zinc-800 text-zinc-200 rounded-tl-none"
                                                    )}>
                                                        {m.text}
                                                    </div>
                                                    <span className="text-[9px] text-zinc-600 mt-1 uppercase tracking-tighter">
                                                        {m.sender === 'me' ? 'Local Operative' : 'Remote Ghost'} • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))}
                                            {isRemoteTyping && (
                                                <div className="flex items-center gap-2 text-zinc-500 italic text-[10px]">
                                                    <div className="flex gap-1">
                                                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" />
                                                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    </div>
                                                    Remote Ghost is typing...
                                                </div>
                                            )}
                                            {messages.length === 0 && !isRemoteTyping && (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-30">
                                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center">
                                                        <Lock className="w-6 h-6 text-zinc-500" />
                                                    </div>
                                                    <p className="text-xs font-mono">Secure E2E Encrypted Data Tunnel</p>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <form onSubmit={sendChatMessage} className="p-4 bg-zinc-900/60 border-t border-white/5 flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Message encrypted tunnel..."
                                                className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-purple-500/50 outline-none"
                                            />
                                            <Button type="submit" disabled={!connection} className="bg-purple-600 hover:bg-purple-500 text-white px-4">
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* --- STATUS FOOTER --- */}
            <div className="h-8 border-t border-white/5 bg-zinc-950 flex items-center px-4 justify-between text-[10px] uppercase tracking-widest text-zinc-600 font-mono">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full items-center",
                            status === 'connected' ? "bg-green-500 shadow-[0_0_5px_#22C55E]" : "bg-zinc-700"
                        )} />
                        <span>Link Status: {status}</span>
                    </div>
                    <div className="hidden sm:block">Bitrate: {status === 'connected' ? '6.4kbps (SECURED)' : '0kbps'}</div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                        <span>Broadcasting: {peerId ? 'ON' : 'OFF'}</span>
                    </div>
                    <div className="hidden sm:block">Protocol: TCP/UDP_TUNNEL_V2</div>
                </div>
            </div>
        </div>
    );
}
