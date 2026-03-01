import PocketBase from 'pocketbase';

// Connect to local PocketBase instance
export const pb = new PocketBase('http://127.0.0.1:8090');

// Type definitions matching our schema
export interface CourseModel {
    id: string;
    originalId: string;
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    category: string;
    keywords: string[];
    icon: string;
    chaptersCount: number;
    expand?: {
        chapters?: ChapterModel[];
    };
}

export interface ChapterModel {
    id: string;
    course: string; // Course ID
    originalId: string;
    title: string;
    content: string;
    duration: string;
    order: number;
    codeBlocks: any[];
    infoBoxes: any[];
}
