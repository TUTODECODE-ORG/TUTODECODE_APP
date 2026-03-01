import { useState, useEffect } from 'react';
import { Cpu, HardDrive, LayoutGrid, Terminal, CheckCircle2, CircleDashed, ArrowRight, Zap, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Types pour le diagnostic matériel
interface HardwareSpecs {
    cpuCores: number;
    cpuModel: string;
    totalRam: number; // en Go
    gpuModel: string | null;
    gpuVram: number | null; // en Go
}

// Types pour les tickets d'incident
interface Ticket {
    id: string;
    title: string;
    context: string;
    status: 'backlog' | 'in_progress' | 'resolved';
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
}

export function Dashboard() {
    const [hardware, setHardware] = useState<HardwareSpecs | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    // Simulation d'un scan hardware (sera remplacé par un call Tauri `invoke('get_hardware_specs')`)
    useEffect(() => {
        const scanHardware = async () => {
            // Simulation call Tauri/Rust `sysinfo`
            await new Promise(resolve => setTimeout(resolve, 1500));
            setHardware({
                cpuCores: 16,
                cpuModel: 'AMD Ryzen 9 5900X',
                totalRam: 32,
                gpuModel: 'NVIDIA RTX 3080',
                gpuVram: 10,
            });
            setIsScanning(false);
        };
        scanHardware();
    }, []);

    const aiRecommendationList = [
        { title: "Déploiement Nginx", reason: "Ta RAM est suffisante pour un cluster Docker local." },
        { title: "Fine-Tuning Llama 3 (1B)", reason: "Ton GPU a > 8Go de VRAM, optimal pour cet exercice." }
    ];

    const tickets: Ticket[] = [
        { id: 'TDC-101', title: 'Le serveur Nginx crash en production', context: 'Memory limit exceeded sur le pod Kubernetes', status: 'in_progress', priority: 'critical', tags: ['Linux', 'Docker'] },
        { id: 'TDC-102', title: 'Configure le Reverse Proxy pour WebSocket', context: 'Les connexions WS timeout après 30s', status: 'backlog', priority: 'high', tags: ['Nginx', 'Network'] },
        { id: 'TDC-103', title: 'Sécurise le port 22 (SSH)', context: 'Fail2Ban doit être installé pour bloquer les scans TCP', status: 'backlog', priority: 'medium', tags: ['Security'] }
    ];

    const priorityColors = {
        low: 'text-slate-400 bg-slate-900',
        medium: 'text-indigo-400 bg-indigo-900/30',
        high: 'text-amber-500 bg-amber-900/30 font-semibold',
        critical: 'text-red-500 bg-red-900/30 font-bold',
    };

    return (
        // Style de fond: Sérénité Technologique (Anthracite #0A0C12)
        <div className="min-h-screen bg-[#0A0C12] text-slate-300 font-sans p-6 md:p-10 selection:bg-indigo-500/30">

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-indigo-500" />
                        Workspace
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Système d'Exploitation Pédagogique - TutoDeCode</p>
                </div>
                <div className="flex items-center gap-3 bg-[#161B22] border border-slate-800 rounded-full px-4 py-2 hover:border-indigo-500/50 transition-colors cursor-pointer group shadow-sm">
                    <Bot className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-slate-300">Agent Local : <span className="text-amber-500">Phi-3.5 (Active)</span></span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Colonne de gauche (2/3): Tickets d'incident */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                        <h2 className="text-lg font-medium text-white flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-indigo-400" />
                            Incidents Actifs (Tickets)
                        </h2>
                        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-transparent">
                            Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="group relative flex flex-col sm:flex-row sm:items-center gap-4 bg-[#161B22] border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-[#1C212A] hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] transition-all cursor-pointer"
                            >
                                <div className="flex-shrink-0">
                                    {ticket.status === 'resolved' ? (
                                        <CheckCircle2 className="w-6 h-6 text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                    ) : ticket.status === 'in_progress' ? (
                                        <CircleDashed className="w-6 h-6 text-amber-500 animate-spin-slow" />
                                    ) : (
                                        <CircleDashed className="w-6 h-6 text-slate-600" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-slate-500">{ticket.id}</span>
                                        <h3 className="text-base font-medium text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                                            {ticket.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">{ticket.context}</p>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                                    <Badge className={`text-[10px] uppercase font-bold tracking-wider rounded-md border-0 px-2 py-0.5 ${priorityColors[ticket.priority]}`}>
                                        {ticket.priority}
                                    </Badge>
                                    <div className="flex gap-1.5">
                                        {ticket.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Colonne de droite (1/3): Diagnostic Matériel & IA */}
                <div className="space-y-6">
                    <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

                        <h2 className="text-sm font-semibold text-slate-400 tracking-wide uppercase mb-6 flex items-center justify-between">
                            Hardware Diagnostics
                            {isScanning && <Zap className="w-4 h-4 text-amber-500 animate-pulse" />}
                        </h2>

                        {isScanning ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                                <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                                <p className="text-sm text-indigo-400/80 animate-pulse">Analyse du système en cours via Rust / Sysinfo...</p>
                            </div>
                        ) : hardware ? (
                            <div className="space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-800/50 text-indigo-400 rounded-lg">
                                        <Cpu className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Processeur Logiciel</p>
                                        <p className="text-sm font-medium text-slate-200">{hardware.cpuModel}</p>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{hardware.cpuCores} Cores Actifs</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-800/50 text-indigo-400 rounded-lg">
                                        <HardDrive className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Mémoire Vive (RAM)</p>
                                        <p className="text-sm font-medium text-slate-200">{hardware.totalRam} Go Disponibles</p>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div className="bg-indigo-500 h-full w-[45%]" />
                                        </div>
                                    </div>
                                </div>

                                {hardware.gpuModel && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-800/50 text-amber-500 rounded-lg">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Unité Graphique (GPU)</p>
                                            <p className="text-sm font-medium text-slate-200">{hardware.gpuModel}</p>
                                            <p className="text-xs text-amber-500/80 font-mono mt-0.5">{hardware.gpuVram} Go VRAM Détectée</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {!isScanning && (
                        <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                            <h3 className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2 mb-3 tracking-wide">
                                <Bot className="w-4 h-4" /> Analyse Prédictive IA
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                Ton matériel (<span className="text-amber-400">{hardware?.gpuVram}Go VRAM</span> détectés) permet l'exécution locale de puissants WebContainers et LLMs Edge.
                            </p>
                            <div className="space-y-2">
                                {aiRecommendationList.map((rec, i) => (
                                    <div key={i} className="bg-[#0A0C12]/50 p-3 rounded-lg border border-slate-800 group-hover:border-amber-500/30 transition-colors">
                                        <p className="text-sm text-slate-200 font-medium mb-1">{rec.title}</p>
                                        <p className="text-xs text-slate-500">{rec.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
