import React from 'react';
import {
    Trophy,
    CheckCircle,
    Lock,
    ArrowRight,
    Terminal,
    Server,
    Globe,
    Database,
    Shield
} from 'lucide-react';

// Data types for the career track
type ModuleStatus = 'locked' | 'active' | 'completed';

interface TrackModule {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    status: ModuleStatus;
    duration: string;
    xpReward: number;
}

interface TrackPhase {
    id: string;
    title: string;
    subtitle: string;
    modules: TrackModule[];
    isLocked: boolean;
}

interface CareerPack {
    id: string;
    title: string;
    level: 'Medium' | 'Expert';
    description: string;
    courses: Array<{ id: string; label: string }>;
}

const CAREER_PACKS: CareerPack[] = [
    {
        id: 'architecte-souverain',
        title: 'Pack Architecte Souverain',
        level: 'Expert',
        description: 'Concevoir et exploiter une stack locale, résiliente et privée de bout en bout.',
        courses: [
            { id: 'self-hosting-pro', label: 'Auto-hébergement Pro' },
            { id: 'proxmox-sovereign-cloud', label: 'Proxmox' },
            { id: 'mesh-networks-wireguard', label: 'Réseaux maillés sécurisés' },
            { id: 'zfs-btrfs-integrity', label: 'ZFS & Btrfs' }
        ]
    },
    {
        id: 'blue-team-ops',
        title: 'Pack Blue Team Opérationnel',
        level: 'Expert',
        description: 'Durcir les systèmes, observer le trafic et réagir vite face aux incidents.',
        courses: [
            { id: 'os-hardening-blue-team', label: 'Hardening OS' },
            { id: 'wireshark-for-threat-detection', label: 'Wireshark Forensics' },
            { id: 'security-basics', label: 'Sécurité Web' }
        ]
    },
    {
        id: 'ai-privee',
        title: 'Pack IA Privée',
        level: 'Medium',
        description: 'Déployer des workflows IA performants sans sortir les données sensibles.',
        courses: [
            { id: 'local-llm-deployment', label: 'LLM locaux' },
            { id: 'private-rag-systems', label: 'RAG privé' },
            { id: 'duckdb-data-science-local', label: 'DuckDB local' }
        ]
    }
];

const DEVOPS_TRACK: TrackPhase[] = [
    {
        id: '1',
        title: 'Phase 1 : Les Fondations',
        subtitle: 'Maîtriser le système et le terminal',
        isLocked: false,
        modules: [
            {
                id: 'linux-basics',
                title: 'Linux Filesystem & Commandes',
                description: 'Naviguer et manipuler le système comme un pro du terminal.',
                icon: Terminal,
                status: 'completed',
                duration: '2h 30m',
                xpReward: 500
            },
            {
                id: 'bash-scripting',
                title: 'Bash Scripting Avancé',
                description: 'Automatiser les tâches répétitives avec des scripts puissants.',
                icon: Terminal,
                status: 'active',
                duration: '4h 00m',
                xpReward: 800
            },
            {
                id: 'security-basics',
                title: 'Permissions & Sécurité',
                description: 'Comprendre chmod, chown et la gestion des utilisateurs.',
                icon: Shield,
                status: 'locked',
                duration: '3h 15m',
                xpReward: 600
            }
        ]
    },
    {
        id: '2',
        title: 'Phase 2 : Conteneurs & Architecture',
        subtitle: 'La révolution Docker',
        isLocked: true,
        modules: [
            {
                id: 'docker-basics',
                title: 'Docker Fondamentaux',
                description: 'Créer, gérer et orchestrer des conteneurs.',
                icon: Server,
                status: 'locked',
                duration: '5h 00m',
                xpReward: 1000
            },
            {
                id: 'db-containers',
                title: 'Bases de Données & Volumes',
                description: 'Persistance des données avec MySQL et Postgres.',
                icon: Database,
                status: 'locked',
                duration: '3h 45m',
                xpReward: 750
            }
        ]
    },
    {
        id: '3',
        title: 'Phase 3 : Cloud & Production',
        subtitle: 'Déployer sur AWS et le Web',
        isLocked: true,
        modules: [
            {
                id: 'networking',
                title: 'Réseaux & Protocoles',
                description: 'DNS, HTTP/S, Load Balancers expliqués.',
                icon: Globe,
                status: 'locked',
                duration: '4h 30m',
                xpReward: 900
            }
        ]
    }
];

interface CareerTrackProps {
    onCourseSelect?: (courseId: string) => void;
}

const CareerTrack: React.FC<CareerTrackProps> = ({ onCourseSelect }) => {

    // Handler for module click
    const handleModuleClick = (moduleId: string, status: ModuleStatus) => {
        if (status === 'locked') {
            alert("Ce module est verrouillé. Terminez les modules précédents pour y accéder !");
            return;
        }
        if (onCourseSelect) {
            // Map track module IDs to actual course IDs if they differ, or ensure they match data/courses
            // Assuming IDs match for simplicity or mapping them here:
            // linux-basics -> linux-bases
            // bash-scripting -> bash-scripting
            // security-basics -> securite
            // docker-basics -> docker
            // db-containers -> database
            // networking -> reseaux

            const courseIdMap: Record<string, string> = {
                'linux-basics': 'linux-bases',
                'bash-scripting': 'bash-scripting',
                'security-basics': 'linux-permissions', // or securite ? Linux Permissions corresponds to 'linux-permissions' file
                'docker-basics': 'docker',
                'db-containers': 'database',
                'networking': 'reseaux'
            };

            const realId = courseIdMap[moduleId] || moduleId;
            onCourseSelect(realId);
        }
    };

    return (
        <div className="h-full bg-[#0a0a0f] text-white p-6 md:p-12 font-sans relative overflow-y-auto custom-scrollbar pb-32">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <header className="mb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                        Parcours Recommandé
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Curriculum DevOps & Infrastructure
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Un parcours pédagogique structuré pour assimiler les compétences clés de l'ingénierie système et de l'automatisation.
                    </p>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {CAREER_PACKS.map((pack) => (
                            <div key={pack.id} className="rounded-xl border border-white/10 bg-gray-900/40 p-4 text-left">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <h3 className="text-sm font-bold text-white">{pack.title}</h3>
                                    <span className="text-[10px] px-2 py-1 rounded border border-blue-500/30 text-blue-300">
                                        {pack.level}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{pack.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {pack.courses.map((course) => (
                                        <button
                                            key={course.id}
                                            type="button"
                                            onClick={() => onCourseSelect?.(course.id)}
                                            className="text-[11px] px-2 py-1 rounded border border-white/15 text-gray-200 hover:border-blue-500/40 hover:text-blue-200 transition-colors"
                                        >
                                            {course.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Global Progress Bar */}
                    <div className="mt-8 bg-gray-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Progression globale</span>
                            <span className="text-blue-400 font-bold">15%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[15%] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </div>
                    </div>
                </header>

                {/* Timeline Track */}
                <div className="space-y-12 relative">
                    {/* Vertical Connectivity Line */}
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/50 via-gray-800 to-gray-800 hidden md:block" />

                    {DEVOPS_TRACK.map((phase, index) => (
                        <div key={phase.id} className="relative">
                            {/* Phase Header */}
                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 bg-[#0a0a0f]
                    ${phase.isLocked ? 'border-gray-800 text-gray-700' : 'border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'}
                 `}>
                                    <span className="text-lg font-bold">{index + 1}</span>
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${phase.isLocked ? 'text-gray-600' : 'text-white'}`}>
                                        {phase.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">{phase.subtitle}</p>
                                </div>
                            </div>

                            {/* Modules Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:pl-16">
                                {phase.modules.map((module) => (
                                    <div
                                        key={module.id}
                                        onClick={() => handleModuleClick(module.id, module.status)}
                                        className={`
                      group relative p-5 rounded-xl border transition-all duration-300
                      ${module.status === 'locked'
                                                ? 'bg-gray-900/20 border-white/5 opacity-60 grayscale cursor-not-allowed'
                                                : 'bg-gray-900/40 border-white/10 hover:border-blue-500/30 hover:bg-gray-800/60 cursor-pointer backdrop-blur-md'}
                      ${module.status === 'active' ? 'ring-1 ring-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : ''}
                    `}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon Box */}
                                            <div className={`
                        p-3 rounded-lg flex-shrink-0
                        ${module.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                    module.status === 'active' ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-600'}
                      `}>
                                                {module.status === 'completed' ? <CheckCircle size={24} /> :
                                                    module.status === 'locked' ? <Lock size={24} /> : <module.icon size={24} />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-lg font-bold mb-1 ${module.status === 'active' ? 'text-blue-100' : 'text-gray-300'}`}>
                                                        {module.title}
                                                    </h4>
                                                    {module.status === 'active' && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/20 animate-pulse">
                                                            EN COURS
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                                    {module.description}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        🕓 {module.duration}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-yellow-500/80">
                                                        <Trophy size={12} /> {module.xpReward} XP
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CTA Arrow (Active Only) */}
                                            {module.status !== 'locked' && (
                                                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                                                    <ArrowRight className="text-blue-400" size={20} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Active Progress Bar */}
                                        {module.status === 'active' && (
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 rounded-b-xl overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[60%]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Boss Fight / Certificate Teaser */}
                <div className="mt-16 p-1 rounded-2xl bg-gradient-to-r from-yellow-600/20 via-orange-500/20 to-red-600/20 mb-24 cursor-default">
                    <div className="bg-[#0a0a0f] p-8 rounded-xl relative overflow-hidden text-center group hover:bg-[#0f0f16] transition-colors">
                        <div className="relative z-10">
                            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] group-hover:scale-110 transition-transform duration-300" />

                            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                                Bilan du <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Curriculum DevOps</span>
                            </h2>

                            <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                                Une attestation de fin de parcours décernée après la validation de l'ensemble des modules pratiques.
                                <br /><br />
                                Ce référentiel atteste de votre capacité à manipuler des environnements Linux, Docker et Cloud de manière autonome.
                            </p>

                            <div className="flex justify-center gap-4">
                                <button disabled className="px-8 py-3 rounded-full bg-gray-800 text-gray-500 font-bold border border-gray-700 cursor-not-allowed flex items-center gap-2 transition-all">
                                    <Lock size={18} />
                                    Attestation non disponible
                                </button>
                            </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-500/10 blur-[100px] group-hover:bg-yellow-500/20 transition-all duration-700" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CareerTrack;
