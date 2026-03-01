import { useState, useEffect } from 'react';
import { Terminal, X, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function LicenseEasterEgg() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'idle' | 'challenge' | 'success'>('idle');
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [, setKeySequence] = useState<string[]>([]);
    const [challenge, setChallenge] = useState<{ q: string; a: string } | null>(null);
    const [uniqueKey, setUniqueKey] = useState('');

    // Konami Code: Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    const challenges = [
        { q: "Quel est le port par défaut du protocole SSH ?", a: "22" },
        { q: "Quelle commande Linux permet de lister les fichiers ?", a: "ls" },
        { q: "Quel est le code HTTP pour 'Non trouvé' ?", a: "404" },
        { q: "En quelle année Git a-t-il été créé ?", a: "2005" },
        { q: "Quel animal représente le langage Python ?", a: "serpent" },
        { q: "Quel est le PID du processus init/systemd ?", a: "1" },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setKeySequence((prev) => {
                const newSeq = [...prev, e.key];
                if (newSeq.length > KONAMI_CODE.length) {
                    newSeq.shift();
                }

                // Check if sequence matches
                if (JSON.stringify(newSeq) === JSON.stringify(KONAMI_CODE)) {
                    triggerEasterEgg();
                    return [];
                }
                return newSeq;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const triggerEasterEgg = () => {
        setIsOpen(true);
        setStep('challenge');
        setLogs(['INITIALIZING SECURE CONNECTION...', 'ACCESSING MAINFRAME...', 'SECURITY BREACH DETECTED', 'VERIFICATION REQUIRED']);
        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        setChallenge(randomChallenge);
        setUniqueKey(generateLicenseKey());
    };

    const generateLicenseKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const segment = () => Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `TUTO-${segment()}-${segment()}-${segment()}-PRO`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!challenge) return;

        if (input.trim().toLowerCase() === challenge.a.toLowerCase()) {
            setLogs((prev) => [...prev, `> ${input}`, 'ACCESS GRANTED.', 'GENERATING LICENSE KEY...']);
            setTimeout(() => setStep('success'), 1000);
        } else {
            setLogs((prev) => [...prev, `> ${input}`, 'ACCESS DENIED.', 'TERMINATING SESSION...']);
            setTimeout(() => {
                setIsOpen(false);
                setLogs([]);
                setInput('');
                setKeySequence([]); // Reset sequence logic
            }, 1500);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(uniqueKey);
        toast.success('Clé de licence copiée !');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-black border-2 border-green-500 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.3)] font-mono overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-green-900 bg-green-950/20">
                    <div className="flex items-center gap-2 text-green-500">
                        <Terminal size={18} />
                        <span className="text-sm font-bold tracking-wider">ROOT_ACCESS_TERMINAL</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-green-700 hover:text-green-500">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="space-y-1 text-green-500/80 text-sm h-32 overflow-y-auto scrollbar-none font-bold">
                        {logs.map((log, i) => (
                            <div key={i} className="animate-in slide-in-from-left-2 duration-300">
                                <span className="mr-2 opacity-50">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))}
                    </div>

                    {step === 'challenge' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-4 border border-green-500/30 bg-green-500/5 rounded text-green-400">
                                <p className="text-sm uppercase opacity-70 mb-1">Security Question:</p>
                                <p className="text-lg font-bold">{challenge?.q}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">{'>'}</span>
                                    <Input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="pl-8 bg-black border-green-700 text-green-500 placeholder:text-green-900 focus-visible:ring-green-500 focus-visible:border-green-500"
                                        placeholder="Entrez la réponse..."
                                        autoFocus
                                    />
                                </div>
                                <Button type="submit" variant="outline" className="border-green-600 text-green-500 hover:bg-green-900 hover:text-green-400">
                                    EXECUTE
                                </Button>
                            </form>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="space-y-6 text-center animate-in zoom-in duration-500">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/20 border border-green-500 mb-2">
                                <ShieldCheck size={48} className="text-green-500" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-green-400 mb-2">ACCESS AUTHORIZED</h3>
                                <p className="text-green-600/80 text-sm">Voici votre clé de licence unique. Conservez-la précieusement.</p>
                            </div>

                            <div className="p-4 bg-green-900/20 border border-dashed border-green-500/50 rounded flex flex-col items-center gap-2">
                                <span className="text-xs text-green-600 uppercase tracking-widest">License Key</span>
                                <code className="text-2xl font-bold text-green-400 tracking-widest select-all">
                                    {uniqueKey}
                                </code>
                            </div>

                            <Button
                                onClick={copyToClipboard}
                                className="w-full bg-green-600 hover:bg-green-500 text-black font-bold"
                            >
                                COPIER LA CLÉ
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-green-900 bg-green-950/30 flex justify-between items-center text-[10px] text-green-800 uppercase">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Secure Connection</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Cpu size={10} />
                        <span>System v.2.4.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
