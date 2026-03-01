import { useState, useEffect } from 'react';

export interface QuizProgress {
    courseId: string;
    currentIndex: number;
    selectedAnswers: Record<string, number>;
    answerTimes: Record<string, number>;
    gameMode: 'normal' | 'timed' | 'survival' | 'certification' | null;
    stats: {
        correctAnswers: number;
        wrongAnswers: number;
        streak: number;
        maxStreak: number;
        totalPoints: number;
        timeBonus: number;
        averageTime: number;
        perfectAnswers: number;
    };
    powerUps: {
        fiftyFifty: number;
        skip: number;
        hint: number;
    };
    lastUpdated: number;
    completed: boolean;
}

const STORAGE_KEY = 'ghost_quiz_progress';
const AUTO_SAVE_INTERVAL = 2000; // Sauvegarde toutes les 2 secondes

/**
 * Hook pour gérer la sauvegarde automatique de la progression des QCMs
 */
export function useQuizProgress(courseId: string) {
    const [progress, setProgress] = useState<QuizProgress | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Charger la progression sauvegardée au montage
    useEffect(() => {
        loadProgress();
    }, [courseId]);

    // Sauvegarder automatiquement la progression
    useEffect(() => {
        if (!progress) return;

        const timer = setTimeout(() => {
            saveProgress(progress);
        }, AUTO_SAVE_INTERVAL);

        return () => clearTimeout(timer);
    }, [progress]);

    /**
     * Charge la progression sauvegardée depuis localStorage
     */
    const loadProgress = (): QuizProgress | null => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return null;

            const allProgress: Record<string, QuizProgress> = JSON.parse(saved);
            const courseProgress = allProgress[courseId];

            if (courseProgress && !courseProgress.completed) {
                setProgress(courseProgress);
                setLastSaved(new Date(courseProgress.lastUpdated));
                return courseProgress;
            }
            return null;
        } catch (error) {
            console.error('Erreur lors du chargement de la progression:', error);
            return null;
        }
    };

    /**
     * Sauvegarde la progression dans localStorage
     */
    const saveProgress = (progressData: QuizProgress) => {
        try {
            setIsSaving(true);

            const saved = localStorage.getItem(STORAGE_KEY);
            const allProgress: Record<string, QuizProgress> = saved ? JSON.parse(saved) : {};

            allProgress[courseId] = {
                ...progressData,
                lastUpdated: Date.now()
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
            setLastSaved(new Date());
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la progression:', error);
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Met à jour la progression
     */
    const updateProgress = (updates: Partial<QuizProgress>) => {
        setProgress(prev => {
            if (!prev) return null;
            return { ...prev, ...updates };
        });
    };

    /**
     * Initialise une nouvelle progression
     */
    const initializeProgress = (gameMode: 'normal' | 'timed' | 'survival' | 'certification') => {
        const newProgress: QuizProgress = {
            courseId,
            currentIndex: 0,
            selectedAnswers: {},
            answerTimes: {},
            gameMode,
            stats: {
                correctAnswers: 0,
                wrongAnswers: 0,
                streak: 0,
                maxStreak: 0,
                totalPoints: 0,
                timeBonus: 0,
                averageTime: 0,
                perfectAnswers: 0
            },
            powerUps: {
                fiftyFifty: 2,
                skip: 1,
                hint: 3
            },
            lastUpdated: Date.now(),
            completed: false
        };

        setProgress(newProgress);
        saveProgress(newProgress);
    };

    /**
     * Marque le quiz comme terminé
     */
    const completeQuiz = () => {
        if (!progress) return;

        const completedProgress = {
            ...progress,
            completed: true,
            lastUpdated: Date.now()
        };

        setProgress(completedProgress);
        saveProgress(completedProgress);
    };

    /**
     * Réinitialise la progression
     */
    const resetProgress = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const allProgress: Record<string, QuizProgress> = JSON.parse(saved);
                delete allProgress[courseId];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
            }
            setProgress(null);
            setLastSaved(null);
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
        }
    };

    /**
     * Vérifie si une sauvegarde existe
     */
    const hasSavedProgress = (): boolean => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return false;

            const allProgress: Record<string, QuizProgress> = JSON.parse(saved);
            const courseProgress = allProgress[courseId];

            return !!courseProgress && !courseProgress.completed;
        } catch {
            return false;
        }
    };

    /**
     * Récupère toutes les progressions sauvegardées
     */
    const getAllProgress = (): Record<string, QuizProgress> => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    };

    /**
     * Calcule le temps écoulé depuis la dernière sauvegarde
     */
    const getTimeSinceLastSave = (): string => {
        if (!lastSaved) return '';

        const now = new Date();
        const diffMs = now.getTime() - lastSaved.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        if (diffHours > 0) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        if (diffMins > 0) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
        return 'à l\'instant';
    };

    return {
        progress,
        isSaving,
        lastSaved,
        loadProgress,
        saveProgress,
        updateProgress,
        initializeProgress,
        completeQuiz,
        resetProgress,
        hasSavedProgress,
        getAllProgress,
        getTimeSinceLastSave
    };
}
