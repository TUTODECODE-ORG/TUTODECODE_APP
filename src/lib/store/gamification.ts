import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LEVELS, ACHIEVEMENTS } from '@/lib/gamification-constants';
// - [x] Verify `useGamification.ts` existence and usage <!-- id: 1 -->
// - [x] Identify and fix missing `Gamification` component imports <!-- id: 2 -->
// - [ ] Resolve general dependency errors (Radix, Lucide, etc.) <!-- id: 8 -->
// - [ ] Fix TypeScript errors in UI components (calendar, chart, input-otp) <!-- id: 9 -->
// - [ ] Verify `npm run build` passes <!-- id: 3 -->

interface GamificationState {
    xp: number;
    level: number;
    streak: number;
    lastLoginDate: string;
    ram: number;
    achievements: string[];
    completedQuests: string[];
    unlockedFeatures: string[];

    addXp: (amount: number) => void;
    unlockAchievement: (id: string) => void;
    completeQuest: (questId: string) => void;
    unlockFeature: (featureId: string) => void;
    checkStreak: () => void;
    consumeRam: (amount: number) => void;
    resetRam: () => void;
}

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set: any) => ({
            xp: 0,
            level: 1,
            streak: 1,
            lastLoginDate: new Date().toISOString(),
            ram: 4096,
            achievements: [],
            completedQuests: [],
            unlockedFeatures: [],

            addXp: (amount: number) => set((state: any) => {
                const newXp = state.xp + amount;

                // Calculate level based on constants
                const currentLevelData = LEVELS.slice().reverse().find(l => newXp >= l.xpRequired) || LEVELS[0];
                const newLevel = currentLevelData.level;

                if (newLevel > state.level) {
                    window.dispatchEvent(new CustomEvent('levelUp', { detail: currentLevelData }));

                    // Unlock features based on level
                    const newFeatures = [...state.unlockedFeatures];
                    if (newLevel >= 5 && !newFeatures.includes('terminal')) newFeatures.push('terminal');
                    if (newLevel >= 10 && !newFeatures.includes('admin_preview')) newFeatures.push('admin_preview');

                    return { xp: newXp, level: newLevel, unlockedFeatures: newFeatures };
                }

                return { xp: newXp, level: newLevel };
            }),

            unlockAchievement: (id: string) => set((state: any) => {
                if (state.achievements.includes(id)) return state;

                const achievement = ACHIEVEMENTS.find(a => a.id === id);
                if (!achievement) return state;

                window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: achievement }));

                // Add XP from achievement
                const newXp = state.xp + achievement.xp;

                return {
                    achievements: [...state.achievements, id],
                    xp: newXp
                };
            }),

            completeQuest: (questId: string) => set((state: any) => {
                if (state.completedQuests.includes(questId)) return state;
                return {
                    completedQuests: [...state.completedQuests, questId],
                    xp: state.xp + 50
                };
            }),

            unlockFeature: (featureId: string) => set((state: any) => ({
                unlockedFeatures: [...state.unlockedFeatures, featureId]
            })),

            checkStreak: () => set((state: any) => {
                const today = new Date().toDateString();
                const lastLogin = new Date(state.lastLoginDate).toDateString();

                if (today === lastLogin) return state;

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                let newStreak = 1;
                if (lastLogin === yesterday.toDateString()) {
                    newStreak = state.streak + 1;
                }

                return {
                    streak: newStreak,
                    lastLoginDate: new Date().toISOString()
                };
            }),

            consumeRam: (amount: number) => set((state: any) => {
                const newRam = Math.max(0, state.ram - amount);
                if (newRam === 0 && state.ram > 0) {
                    setTimeout(() => window.dispatchEvent(new Event('outOfMemory')), 100);
                }
                return { ram: newRam };
            }),

            resetRam: () => set({ ram: 4096 }),
        }),
        {
            name: 'ghost-framework-gamification',
        }
    ) as any
);
