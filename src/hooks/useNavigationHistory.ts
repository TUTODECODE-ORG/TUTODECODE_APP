import { useState, useCallback, useEffect } from 'react';
import { storage } from '@/utils/storage';
import type { Course } from '@/types';

interface HistoryEntry {
    courseId: string;
    timestamp: number;
    progress: number;
}

const MAX_HISTORY = 20;

/**
 * Hook pour gérer l'historique de navigation des cours
 */
export function useNavigationHistory() {
    const [history, setHistory] = useState<HistoryEntry[]>(() =>
        storage.get<HistoryEntry[]>('course-history', [])
    );

    // Persist to storage
    useEffect(() => {
        storage.set('course-history', history);
    }, [history]);

    const addToHistory = useCallback((course: Course, progress: number) => {
        setHistory(prev => {
            // Remove existing entry for this course
            const filtered = prev.filter(h => h.courseId !== course.id);

            // Add new entry at the beginning
            const newHistory = [
                {
                    courseId: course.id,
                    timestamp: Date.now(),
                    progress
                },
                ...filtered
            ].slice(0, MAX_HISTORY);

            return newHistory;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        storage.remove('course-history');
    }, []);

    const getRecentCourses = useCallback((allCourses: Course[], limit = 5) => {
        return history
            .slice(0, limit)
            .map(h => allCourses.find(c => c.id === h.courseId))
            .filter((c): c is Course => c !== undefined);
    }, [history]);

    return {
        history,
        addToHistory,
        clearHistory,
        getRecentCourses
    };
}
