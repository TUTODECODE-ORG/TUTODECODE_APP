import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import type { Course, CourseSection } from '@/types';
import { getIcon } from '@/utils/icons';
import { courses as localCourses } from '@/data/courses/source_data';

export function useCoursesData() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true);
            try {
                // 1. Try Fetching from PocketBase
                let records: any[] = [];
                let pbError = false;

                try {
                    records = await pb.collection('courses').getFullList({
                        sort: 'created',
                        expand: 'chapters_via_course',
                    });
                } catch (e) {
                    console.warn("PocketBase fetch failed, switching to local mode.", e);
                    pbError = true;
                }

                // 2. Process Data or Fallback
                if (!pbError && records && records.length > 0) {
                    const mappedCourses: Course[] = records.map((rec: any) => {
                        const chapters = rec.expand?.['chapters_via_course'] || [];
                        chapters.sort((a: any, b: any) => a.order - b.order);

                        const content: CourseSection[] = chapters.map((chap: any) => ({
                            id: chap.originalId,
                            title: chap.title,
                            content: chap.content,
                            duration: chap.duration,
                            codeBlocks: chap.codeBlocks,
                            infoBoxes: chap.infoBoxes,
                        }));

                        return {
                            id: rec.originalId,
                            title: rec.title,
                            description: rec.description,
                            level: rec.level,
                            duration: rec.duration,
                            category: rec.category,
                            chapters: rec.chaptersCount || content.length,
                            keywords: rec.keywords,
                            icon: getIcon(rec.icon) as any,
                            content: content,
                            quiz: [],
                            exercises: [],
                            cheatsheet: []
                        };
                    });
                    setCourses(mappedCourses);
                } else {
                    // Fallback to local static data
                    console.log("Using local static course data (Fallback)");
                    setCourses(localCourses);
                }

                setError(null);
            } catch (err: any) {
                console.error("Critical error in course fetching:", err);
                // Last resort fallback
                setCourses(localCourses);
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, []);

    return { courses, loading, error };
}
