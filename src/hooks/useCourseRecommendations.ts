import { useMemo } from 'react';
import type { Course } from '@/types';

interface RecommendationScore {
    course: Course;
    score: number;
    reasons: string[];
}

/**
 * Hook intelligent pour recommander des cours basés sur :
 * - Cours complétés
 * - Progression actuelle
 * - Niveau de l'utilisateur
 * - Mots-clés similaires
 */
export function useCourseRecommendations(
    allCourses: Course[],
    completed: string[],
    progress: Record<string, number>,
    currentCourse?: Course
): Course[] {
    return useMemo(() => {
        const recommendations: RecommendationScore[] = [];

        // Get user level based on completed courses
        const userLevel = getUserLevel(completed, allCourses);

        // Get user interests from completed courses
        const userInterests = getUserInterests(completed, allCourses);

        for (const course of allCourses) {
            // Skip already completed courses
            if (completed.includes(course.id)) continue;

            // Skip current course
            if (currentCourse && course.id === currentCourse.id) continue;

            let score = 0;
            const reasons: string[] = [];

            // 1. Level match (prefer same or next level)
            if (course.level === userLevel) {
                score += 30;
                reasons.push('Adapté à votre niveau');
            } else if (
                (userLevel === 'beginner' && course.level === 'intermediate') ||
                (userLevel === 'intermediate' && course.level === 'advanced')
            ) {
                score += 20;
                reasons.push('Prochaine étape recommandée');
            }

            // 2. Keyword overlap with interests
            const keywordOverlap = course.keywords.filter(k =>
                userInterests.some(i => i.toLowerCase().includes(k.toLowerCase()))
            ).length;
            score += keywordOverlap * 10;
            if (keywordOverlap > 0) {
                reasons.push('Basé sur vos intérêts');
            }

            // 3. Category continuation
            if (currentCourse && course.category === currentCourse.category) {
                score += 15;
                reasons.push('Suite logique de votre parcours');
            }

            // 4. Partial progress bonus
            const courseProgress = progress[course.id] || 0;
            if (courseProgress > 0 && courseProgress < 100) {
                score += 25;
                reasons.push('Cours en cours');
            }

            // 5. Popularity (based on chapters - more chapters = more comprehensive)
            score += Math.min((course.chapters || 0) * 2, 10);

            if (score > 0) {
                recommendations.push({ course, score, reasons });
            }
        }

        // Sort by score and return top 6
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map(r => r.course);
    }, [allCourses, completed, progress, currentCourse]);
}

function getUserLevel(completed: string[], allCourses: Course[]): 'beginner' | 'intermediate' | 'advanced' {
    if (completed.length === 0) return 'beginner';

    const completedCourses = allCourses.filter(c => completed.includes(c.id));
    const levels = completedCourses.map(c => c.level);

    const advancedCount = levels.filter(l => l === 'advanced').length;
    const intermediateCount = levels.filter(l => l === 'intermediate').length;

    if (advancedCount >= 2) return 'advanced';
    if (intermediateCount >= 2 || completedCourses.length >= 5) return 'intermediate';
    return 'beginner';
}

function getUserInterests(completed: string[], allCourses: Course[]): string[] {
    const completedCourses = allCourses.filter(c => completed.includes(c.id));
    const allKeywords = completedCourses.flatMap(c => c.keywords);

    // Count keyword frequency
    const keywordCount: Record<string, number> = {};
    for (const keyword of allKeywords) {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
    }

    // Return top keywords
    return Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword]) => keyword);
}
