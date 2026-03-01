import { cn } from '@/lib/utils';
import type { Course } from '@/types';

interface HomeDashboardProps {
    courses: Course[];
    completed: string[];
    onCourseSelect: (course: Course) => void;
}

const getCourseIcon = (category: string) => {
    switch (category) {
        case 'linux': return 'L_';
        case 'devops': return 'D_';
        case 'kernel': return 'K_';
        case 'ship': return 'S_';
        case 'shield': return 'H_';
        case 'forge': return 'F_';
        default: return 'C_';
    }
}

export function HomeDashboard({ courses, completed, onCourseSelect }: HomeDashboardProps) {
    return (
        <div className="max-w-5xl mx-auto font-mono mt-8">
            <header className="mb-12 border-b border-zinc-800 pb-4 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase">
                        <span className="text-td-primary mr-2">_</span>Dossiers
                    </h2>
                    <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">
                        Sélectionnez un contrat pour initialiser le transfert.
                    </p>
                </div>
                <div className="hidden sm:block">
                    <div className="h-1 w-32 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-td-secondary w-1/3 animate-pulse"></div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, idx) => {
                    const isCompleted = completed.includes(course.id);
                    const levelStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
                    return (
                        <div
                            key={course.id}
                            onClick={() => onCourseSelect(course)}
                            className={cn(
                                "group relative bg-[#0a0a0b] border-2 transition-all duration-300 cursor-pointer overflow-hidden",
                                isCompleted ? "border-td-primary" : "border-zinc-800 hover:border-td-accent hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(112,0,255,0.4)]"
                            )}
                        >
                            {/* Decorative Top Bar */}
                            <div className="h-1 w-full flex">
                                <div className={cn("h-full w-1/4", isCompleted ? "bg-td-primary" : "bg-zinc-700 group-hover:bg-td-secondary transition-colors")}></div>
                                <div className="h-full w-1/2 bg-transparent"></div>
                                <div className={cn("h-full w-1/4", isCompleted ? "bg-td-primary" : "bg-zinc-700 group-hover:bg-td-secondary transition-colors")}></div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-zinc-900 border border-zinc-700 px-2 py-1 flex items-center gap-2 group-hover:border-td-accent/50 transition-colors">
                                        <span className="text-td-primary font-bold">{getCourseIcon(course.category)}</span>
                                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">SEQ_{levelStr}</span>
                                    </div>
                                    {isCompleted && (
                                        <div className="text-[10px] text-white bg-td-primary px-2 py-0.5 font-bold animate-pulse">
                                            [ CLEAR ]
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-white font-bold text-xl mb-3 leading-tight group-hover:text-td-secondary transition-colors">
                                    {course.title}
                                </h3>

                                <p className="text-zinc-500 text-xs mb-6 leading-relaxed line-clamp-3">
                                    {course.description}
                                </p>

                                <div className="mt-auto space-y-4">
                                    {/* Fake Progress/Circuit Line */}
                                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="w-1 h-1 bg-td-primary rounded-full"></div>
                                        <div className="h-px bg-td-secondary flex-1"></div>
                                        <div className="w-1 h-1 bg-td-primary rounded-full"></div>
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                                        <div className="flex gap-3 text-zinc-400">
                                            <span>SYS: {course.category}</span>
                                            <span>DUR: {course.duration || 'N/A'}</span>
                                        </div>
                                        <div className="text-td-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
                                            ./START
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Glitch Overlay Effect on Hover */}
                            <div className="absolute inset-0 bg-td-accent/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mix-blend-screen"></div>

                            {/* Decorative corner brackets */}
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-700 group-hover:border-td-secondary transition-colors m-1"></div>
                        </div>
                    );
                })}
            </div>

            <footer className="mt-20 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
                <div className="text-[10px] text-zinc-600 text-center md:text-left leading-relaxed">
                    TUTODECODE_SYS // ALL RIGHTS RESERVED 2026<br />
                    <span className="text-td-secondary/50">SECURE_CONNECTION_ESTABLISHED</span>
                </div>
                <div className="flex gap-6">
                    <span className="text-[10px] text-zinc-500 hover:text-td-primary cursor-pointer transition-colors uppercase tracking-widest">[ GITHUB ]</span>
                    <span className="text-[10px] text-zinc-500 hover:text-td-primary cursor-pointer transition-colors uppercase tracking-widest">[ DISCORD ]</span>
                </div>
            </footer>
        </div>
    );
}
