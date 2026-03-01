import { useEffect, useState } from 'react';
import { Trophy, Zap, Crown, Share2, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGamification } from '@/hooks/useGamification';
import { LEVELS } from '@/lib/gamification-constants';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/* --- HOOK POUR LES EFFETS --- */
function useConfetti() {
    const fire = () => {
        // Simple placeholder for confetti logic, in a real app use 'canvas-confetti'
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        for (let i = 0; i < 50; i++) {
            const el = document.createElement('div');
            el.style.position = 'fixed';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.top = '-10px';
            el.style.width = '10px';
            el.style.height = '10px';
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.zIndex = '9999';
            el.style.animation = `fall ${Math.random() * 2 + 1}s linear forwards`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 3000);
        }
    };
    return fire;
}

/* --- COMPOSANT BANNER SIDEBAR --- */
export function UserProfileCard() {
    const { xp, level, streak, achievements, ram } = useGamification();

    // Logic derived from constants
    const currentLevelData = LEVELS.find(l => l.level === level) || LEVELS[0];
    const nextLevelData = LEVELS.find(l => l.level === level + 1) || null;

    const progressToNextLevel = nextLevelData
        ? Math.min(100, Math.max(0, ((xp - currentLevelData.xpRequired) / (nextLevelData.xpRequired - currentLevelData.xpRequired)) * 100))
        : 100;

    const handleShareProfile = async () => {
        const text = `Je suis niveau ${level} (${currentLevelData.name}) sur Ghost Framework ! 🚀\nJ'ai ${xp} XP et ${streak} jours de streak. Viens me défier !`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mon Profil Ghost Framework',
                    text: text,
                    url: window.location.origin
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(`${text} ${window.location.origin}`);
            alert('Profil copié !');
        }
    }

    return (
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 text-white shadow-lg mb-6 relative group">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleShareProfile}
                title="Partager mon profil"
            >
                <Share2 className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-inner border-2 border-white/20">
                    {currentLevelData.icon}
                </div>
                <div>
                    <h3 className="font-bold text-sm text-yellow-50">{currentLevelData.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-300">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span>Niveau {level}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>{xp} XP</span>
                    <span>{nextLevelData ? nextLevelData.xpRequired : 'MAX'} XP</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2 bg-slate-700 [&>div]:bg-yellow-500" />
                <p className="text-[10px] text-right text-slate-500 mt-1">
                    {nextLevelData ? `${nextLevelData.xpRequired - xp} XP pour le niveau ${nextLevelData.level}` : 'Niveau Max atteint !'}
                </p>
            </div>

            <div className="mt-4 space-y-1 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" /> VRAM Core</span>
                    <span className={cn(ram < 1024 ? "text-red-400 animate-pulse" : "text-cyan-400")}>
                        {ram} / 4096 MB
                    </span>
                </div>
                <Progress value={(ram / 4096) * 100} className="h-1.5 bg-slate-800 [&>div]:bg-cyan-500" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-700/50">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-400 font-bold">
                        <Zap className="w-3 h-3" />
                        {streak}
                    </div>
                    <p className="text-[10px] text-slate-400">Série (jours)</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 font-bold">
                        <Trophy className="w-3 h-3" />
                        {achievements.length}
                    </div>
                    <p className="text-[10px] text-slate-400">Succès</p>
                </div>
            </div>
        </div>
    );
}

/* --- MODAL LEVEL UP --- */
export function LevelUpShowcase() {
    const [newLevel, setNewLevel] = useState<typeof LEVELS[0] | null>(null);
    const fireConfetti = useConfetti();

    useEffect(() => {
        const handleLevelUp = (e: Event) => {
            const customEvent = e as CustomEvent<typeof LEVELS[0]>;
            setNewLevel(customEvent.detail);
            fireConfetti();
        };

        window.addEventListener('levelUp', handleLevelUp);
        return () => window.removeEventListener('levelUp', handleLevelUp);
    }, [fireConfetti]);

    if (!newLevel) return null;

    const handleShare = async () => {
        if (!newLevel) return;
        const text = `Je viens de passer au niveau ${newLevel.level} : ${newLevel.name} sur Ghost Framework ! 🚀\nRejoins-moi pour apprendre le code !`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Niveau Supérieur sur Ghost Framework !',
                    text: text,
                    url: window.location.origin
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(`${text} ${window.location.origin}`);
            // Fallback visuel simple (alert pour l'instant, idéalement un toast)
            alert('Message copié dans le presse-papier !');
        }
    };

    return (
        <Dialog open={!!newLevel} onOpenChange={() => setNewLevel(null)}>
            <DialogContent className="sm:max-w-md border-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white">
                <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-purple-500 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-[0] right-[0] w-[200px] h-[200px] bg-blue-500 rounded-full blur-[80px] opacity-30"></div>
                </div>

                <DialogHeader className="relative z-10 flex flex-col items-center text-center pt-8">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-50 animate-pulse rounded-full"></div>
                        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-6xl shadow-xl border-4 border-white/20">
                            {newLevel.icon}
                        </div>
                    </div>

                    <DialogTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2">
                        NIVEAU SUPÉRIEUR !
                    </DialogTitle>

                    <DialogDescription className="text-slate-300 text-lg">
                        Félicitations ! Vous êtes maintenant un
                    </DialogDescription>

                    <div className="mt-4 px-6 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                        <span className="text-xl font-bold text-yellow-100">{newLevel.name}</span>
                    </div>

                    <p className="mt-6 text-sm text-slate-400 max-w-xs mx-auto">
                        Vous avez débloqué de nouvelles fonctionnalités et votre badge a été mis à jour. Continuez comme ça !
                    </p>
                </DialogHeader>

                <div className="relative z-10 flex flex-col gap-3 pb-6 pt-4 px-8">
                    <Button
                        onClick={() => setNewLevel(null)}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Continuer l'aventure 🚀
                    </Button>

                    <Button
                        onClick={handleShare}
                        variant="ghost"
                        className="w-full border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Partager ma réussite
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* --- TOAST SUCCESS --- */
export function AchievementToast() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [achievement, setAchievement] = useState<any | null>(null);

    useEffect(() => {
        const handleUnlock = (e: Event) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const customEvent = e as CustomEvent<any>;
            setAchievement(customEvent.detail);
            setTimeout(() => setAchievement(null), 4000);
        };

        window.addEventListener('achievementUnlocked', handleUnlock);
        return () => window.removeEventListener('achievementUnlocked', handleUnlock);
    }, []);

    if (!achievement) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-4 bg-slate-900 border border-yellow-500/30 p-4 rounded-xl shadow-2xl shadow-yellow-500/10 max-w-sm">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-2xl border border-yellow-500/20">
                    {achievement.icon}
                </div>
                <div>
                    <h4 className="font-bold text-yellow-500 text-sm uppercase tracking-wider">Succès Débloqué !</h4>
                    <p className="font-bold text-white leading-tight">{achievement.name}</p>
                    <p className="text-xs text-slate-400 mt-1">+{achievement.xp} XP</p>
                </div>
            </div>
        </div>
    );
}
