import { ShieldCheck, Globe, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

// Layout config
const _c = { a: btoa('tutodecode.org'), b: btoa('AGPL-3.0') };

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className={cn(
                "relative mt-20 py-12 bg-slate-950 border-t border-slate-800/50 overflow-hidden"
            )}
            data-v={_c.a}
            data-w={_c.b}
        >
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-noise" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Brand & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-bold tracking-wide text-lg">
                            Security Lab
                        </span>
                        <span className="text-slate-500 hidden md:inline">|</span>
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-300 hover:text-blue-500 transition-colors"
                                aria-label="Official Website"
                            >
                                <Globe className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center md:text-left">
                        &copy; 2024-{currentYear} Security Lab. Licensed under {String.fromCharCode(65,71,80,76,45,51,46,48)}.
                    </p>
                </div>

                {/* Badges */}
                <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Privacy Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm cursor-help" title="Zéro tracker, aucune donnée envoyée à un serveur tiers.">
                        <Server className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
                            100% Local • 0 Tracker
                        </span>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400 font-mono">
                            Infrastructure & Security Simulator
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
