import { useState, useEffect } from 'react';
import type { Course } from '@/types';

const OFFLINE_COURSES_KEY = 'ghost_offline_courses';
const OFFLINE_ENABLED_KEY = 'ghost_offline_enabled';

interface OfflineState {
    isEnabled: boolean;
    savedCourses: string[]; // IDs des cours sauvegardés
    totalSize: number; // Taille approximative en bytes
}

/**
 * Hook pour gérer le mode offline et la sauvegarde des cours
 */
export function useOfflineMode() {
    const [state, setState] = useState<OfflineState>(() => {
        try {
            const savedCourses = JSON.parse(localStorage.getItem(OFFLINE_COURSES_KEY) || '[]');
            const isEnabled = localStorage.getItem(OFFLINE_ENABLED_KEY) === 'true';

            return {
                isEnabled,
                savedCourses,
                totalSize: 0,
            };
        } catch {
            return {
                isEnabled: false,
                savedCourses: [],
                totalSize: 0,
            };
        }
    });

    /**
     * Sauvegarder un cours pour utilisation offline
     */
    const saveCourseOffline = async (course: Course): Promise<boolean> => {
        try {
            // Sauvegarder le cours dans localStorage
            const offlineCourses = JSON.parse(localStorage.getItem(OFFLINE_COURSES_KEY) || '[]');

            if (!offlineCourses.includes(course.id)) {
                offlineCourses.push(course.id);
                localStorage.setItem(OFFLINE_COURSES_KEY, JSON.stringify(offlineCourses));

                // Sauvegarder le contenu complet du cours
                localStorage.setItem(`course_${course.id}`, JSON.stringify(course));

                setState(prev => ({
                    ...prev,
                    savedCourses: offlineCourses,
                }));

                console.log(`✅ Cours "${course.title}" sauvegardé pour utilisation offline`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde offline:', error);
            return false;
        }
    };

    /**
     * Supprimer un cours du mode offline
     */
    const removeCourseOffline = async (courseId: string): Promise<boolean> => {
        try {
            const offlineCourses = JSON.parse(localStorage.getItem(OFFLINE_COURSES_KEY) || '[]');
            const updatedCourses = offlineCourses.filter((id: string) => id !== courseId);

            localStorage.setItem(OFFLINE_COURSES_KEY, JSON.stringify(updatedCourses));
            localStorage.removeItem(`course_${courseId}`);

            setState(prev => ({
                ...prev,
                savedCourses: updatedCourses,
            }));

            console.log(`🗑️ Cours ${courseId} supprimé du mode offline`);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            return false;
        }
    };

    /**
     * Récupérer un cours depuis le stockage offline
     */
    const getOfflineCourse = (courseId: string): Course | null => {
        try {
            const courseData = localStorage.getItem(`course_${courseId}`);
            return courseData ? JSON.parse(courseData) : null;
        } catch {
            return null;
        }
    };

    /**
     * Vérifier si un cours est disponible offline
     */
    const isCourseAvailableOffline = (courseId: string): boolean => {
        return Array.isArray(state.savedCourses) && state.savedCourses.includes(courseId);
    };

    /**
     * Sauvegarder tous les cours pour mode offline
     */
    const saveAllCoursesOffline = async (courses: Course[]): Promise<number> => {
        let savedCount = 0;

        for (const course of courses) {
            const success = await saveCourseOffline(course);
            if (success) savedCount++;
        }

        return savedCount;
    };

    /**
     * Supprimer tous les cours offline
     */
    const clearAllOfflineCourses = async (): Promise<void> => {
        try {
            const offlineCourses = state.savedCourses;

            for (const courseId of offlineCourses) {
                localStorage.removeItem(`course_${courseId}`);
            }

            localStorage.removeItem(OFFLINE_COURSES_KEY);

            setState(prev => ({
                ...prev,
                savedCourses: [],
                totalSize: 0,
            }));

            console.log('🗑️ Tous les cours offline ont été supprimés');
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
        }
    };

    /**
     * Activer/désactiver le mode offline
     */
    const toggleOfflineMode = async (): Promise<boolean> => {
        const newState = !state.isEnabled;
        localStorage.setItem(OFFLINE_ENABLED_KEY, String(newState));

        setState(prev => ({
            ...prev,
            isEnabled: newState,
        }));

        console.log(`Mode offline ${newState ? 'activé' : 'désactivé'}`);
        return newState;
    };

    /**
     * Calculer la taille approximative du stockage offline
     */
    const calculateStorageSize = (): number => {
        try {
            let totalSize = 0;

            for (const courseId of state.savedCourses) {
                const courseData = localStorage.getItem(`course_${courseId}`);
                if (courseData) {
                    totalSize += new Blob([courseData]).size;
                }
            }

            setState(prev => ({
                ...prev,
                totalSize,
            }));

            return totalSize;
        } catch {
            return 0;
        }
    };

    /**
     * Formater la taille en MB/KB
     */
    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    /**
     * Vérifier l'espace de stockage disponible
     */
    const getStorageInfo = async (): Promise<{
        usage: number;
        quota: number;
        available: number;
        percentage: number;
    }> => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const available = quota - usage;
            const percentage = quota > 0 ? (usage / quota) * 100 : 0;

            return { usage, quota, available, percentage };
        }

        return { usage: 0, quota: 0, available: 0, percentage: 0 };
    };

    // Calculer la taille au montage
    useEffect(() => {
        calculateStorageSize();
    }, [state.savedCourses]);

    return {
        ...state,
        saveCourseOffline,
        removeCourseOffline,
        getOfflineCourse,
        isCourseAvailableOffline,
        saveAllCoursesOffline,
        clearAllOfflineCourses,
        toggleOfflineMode,
        calculateStorageSize,
        formatSize: (bytes?: number) => formatSize(bytes || state.totalSize),
        getStorageInfo,
    };
}
