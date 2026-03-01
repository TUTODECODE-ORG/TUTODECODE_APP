import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Définition des niveaux (avec XP exponentiel pour le challenge)
const LEVELS = [
    { level: 1, name: "Novice du Code", xpRequired: 0, icon: "🌱" },
    { level: 2, name: "Apprenti Développeur", xpRequired: 500, icon: "🔨" },
    { level: 3, name: "Codeur Initié", xpRequired: 1500, icon: "💻" },
    { level: 4, name: "Développeur Junior", xpRequired: 3000, icon: "🚀" },
    { level: 5, name: "Bug Hunter", xpRequired: 5000, icon: "🐛" },
    { level: 6, name: "Développeur Confirmé", xpRequired: 8000, icon: "⚡" },
    { level: 7, name: "Tech Lead", xpRequired: 12000, icon: "👑" },
    { level: 8, name: "Architecte Logiciel", xpRequired: 18000, icon: "🏛️" },
    { level: 9, name: "Grand Maître", xpRequired: 25000, icon: "🔮" },
    { level: 10, name: "Légende du Code", xpRequired: 35000, icon: "🌟" },
    { level: 11, name: "Titan de la Tech", xpRequired: 50000, icon: "🦾" },
    { level: 12, name: "Oracle du Binaire", xpRequired: 70000, icon: "👁️" },
    { level: 13, name: "Seigneur des Algorithmes", xpRequired: 100000, icon: "🏰" },
    { level: 14, name: "Sorcier du Système", xpRequired: 150000, icon: "🧙‍♂️" },
    { level: 15, name: "Divinité du Code", xpRequired: 250000, icon: "🌌" },
];

const ACHIEVEMENTS = [
    { id: 'first_course', name: 'Premier Pas', description: 'Terminer votre premier cours', icon: '🎓', xp: 100 },
    { id: 'quiz_master', name: 'Quiz Master', description: 'Obtenir 100% à un quiz', icon: '🎯', xp: 200 },
    { id: 'streak_3', name: 'Régulier', description: '3 jours de suite', icon: '🔥', xp: 300 },
    { id: 'streak_7', name: 'Acharné', description: '7 jours de suite', icon: '⚡', xp: 1000 },
    { id: 'speed_demon', name: 'L\'Éclair', description: 'Finir un quiz en moins de 1min', icon: '⚡', xp: 150 },
    { id: 'night_owl', name: 'Oiseau de Nuit', description: 'Étudier après 22h', icon: '🦉', xp: 100 },
];

interface UserStats {
    xp: number;
    level: number;
    streak: number;
    lastLoginDate: string;
    achievements: string[]; // IDs des succès débloqués
    unlockedFeatures: string[]; // 'terminal', 'dark-web', etc.
    coursesCompleted: number;
    quizzesPassed: number;
    ram: number; // RAM restante en Mo
}

interface GamificationContextType {
    stats: UserStats;
    currentLevelData: typeof LEVELS[0];
    nextLevelData: typeof LEVELS[0] | null;
    progressToNextLevel: number; // Pourcentage
    addXp: (amount: number, source?: string) => void;
    unlockAchievement: (id: string) => void;
    unlockFeature: (featureId: string) => void;
    checkStreak: () => void;
    consumeRam: (amount: number) => void;
    resetRam: () => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [stats, setStats] = useState<UserStats>(() => {
        // SSR safe check
        if (typeof window === 'undefined') return { xp: 0, level: 1, streak: 0, lastLoginDate: '', achievements: [], unlockedFeatures: [], coursesCompleted: 0, quizzesPassed: 0, ram: 4096 };

        try {
            const saved = localStorage.getItem('tuto_gamification');
            return saved ? JSON.parse(saved) : {
                xp: 0,
                level: 1,
                streak: 1,
                lastLoginDate: new Date().toISOString(),
                achievements: [],
                unlockedFeatures: [],
                coursesCompleted: 0,
                quizzesPassed: 0,
                ram: 4096
            };
        } catch (e) {
            console.error('Erreur lecture localStorage', e);
            // Fallback safe
            return {
                xp: 0,
                level: 1,
                streak: 1,
                lastLoginDate: new Date().toISOString(),
                achievements: [],
                unlockedFeatures: [],
                coursesCompleted: 0,
                quizzesPassed: 0,
                ram: 4096
            };
        }
    });

    // Sauvegarde automatique
    useEffect(() => {
        try {
            localStorage.setItem('tuto_gamification', JSON.stringify(stats));
        } catch (e) {
            console.error('Erreur sauvegarde localStorage', e);
        }
    }, [stats]);

    // Helpers dérivés (mémorisés pour éviter recalculs inutiles lors du render)
    const currentLevelData = LEVELS.slice().reverse().find(l => stats.xp >= l.xpRequired) || LEVELS[0];
    const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevelData.level) + 1;
    const nextLevelData = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;

    const progressToNextLevel = nextLevelData
        ? Math.min(100, Math.max(0, ((stats.xp - currentLevelData.xpRequired) / (nextLevelData.xpRequired - currentLevelData.xpRequired)) * 100))
        : 100;

    // Gestion de la montée de niveau et déblocage features
    useEffect(() => {
        // Si le niveau calculé est supérieur au niveau stocké, on met à jour
        if (currentLevelData.level > stats.level) {
            setStats(prev => ({ ...prev, level: currentLevelData.level }));

            // Notification visuelle
            console.log(`🎉 NIVEAU UP ! Bienvenue niveau ${currentLevelData.level}`);
            window.dispatchEvent(new CustomEvent('levelUp', { detail: currentLevelData }));

            // Déblocage automatique de features
            if (currentLevelData.level >= 5) unlockFeature('terminal');
            if (currentLevelData.level >= 10) unlockFeature('admin_preview');
        }
    }, [currentLevelData.level, stats.level]); // Dépendance sur currentLevelData.level calculé à partir de XP

    const addXp = useCallback((amount: number, source?: string) => {
        setStats(prev => {
            const newXp = prev.xp + amount;
            console.log(`➕ Gain XP: +${amount} (${source || 'Inconnu'}) -> Total: ${newXp}`);
            return { ...prev, xp: newXp };
        });
    }, []);

    const unlockAchievement = useCallback((id: string) => {
        setStats(prev => {
            if (prev.achievements.includes(id)) return prev;

            const achievement = ACHIEVEMENTS.find(a => a.id === id);
            if (!achievement) return prev;

            // Decouple the event dispatch to avoid "Cannot update during render" errors
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: achievement }));
            }, 0);

            // On ajoute l'XP du succès
            return {
                ...prev,
                achievements: [...prev.achievements, id],
                xp: prev.xp + achievement.xp
            };
        });
    }, []);

    // Nouvelle fonction: Débloquer une feature spécifique
    const unlockFeature = useCallback((featureId: string) => {
        setStats(prev => {
            if (prev.unlockedFeatures.includes(featureId)) return prev;
            console.log(`🔓 Feature débloquée: ${featureId}`);
            return { ...prev, unlockedFeatures: [...prev.unlockedFeatures, featureId] };
        });
    }, []);

    const consumeRam = useCallback((amount: number) => {
        setStats(prev => {
            const newRam = Math.max(0, prev.ram - amount);
            if (newRam === 0 && prev.ram > 0) {
                // Déclencher un événement global 'outOfMemory'
                setTimeout(() => window.dispatchEvent(new Event('outOfMemory')), 100);
            }
            return { ...prev, ram: newRam };
        });
    }, []);

    const resetRam = useCallback(() => {
        setStats(prev => ({ ...prev, ram: 4096 }));
    }, []);

    const checkStreak = useCallback(() => {
        setStats(prev => {
            const today = new Date().toDateString();
            const lastLogin = new Date(prev.lastLoginDate).toDateString();

            if (today === lastLogin) return prev; // Déjà connecté aujourd'hui

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let newStreak = 1;
            // Si la dernière connexion date d'hier, on incrémente le streak
            if (lastLogin === yesterday.toDateString()) {
                newStreak = prev.streak + 1;
            }

            return {
                ...prev,
                streak: newStreak,
                lastLoginDate: new Date().toISOString()
            };
        });
    }, []);

    // Effet pour vérifier les succès liés au streak APRÈS mise à jour du state
    useEffect(() => {
        if (stats.streak >= 3 && !stats.achievements.includes('streak_3')) unlockAchievement('streak_3');
        if (stats.streak >= 7 && !stats.achievements.includes('streak_7')) unlockAchievement('streak_7');
    }, [stats.streak, stats.achievements, unlockAchievement]);

    // Vérifications au montage
    useEffect(() => {
        // Vérifie le streak au chargement de l'app
        checkStreak();

        // Check night owl (une seule fois par session)
        const hour = new Date().getHours();
        if ((hour >= 22 || hour < 4) && !stats.achievements.includes('night_owl')) {
            unlockAchievement('night_owl');
        }
    }, [checkStreak, unlockAchievement, stats.achievements]); // dépendances stables

    return (
        <GamificationContext.Provider value={{
            stats,
            currentLevelData,
            nextLevelData,
            progressToNextLevel,
            addXp,
            unlockAchievement,
            unlockFeature,
            checkStreak,
            consumeRam,
            resetRam
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) throw new Error('useGamification must be used within a GamificationProvider');
    return context;
};

export { LEVELS, ACHIEVEMENTS };
