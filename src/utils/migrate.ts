import { pb } from '@/lib/pocketbase';
import { courses } from '@/data/courses/source_data';

export const migrateData = async () => {
    console.log('Starting migration...');
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const course of courses) {
        try {
            // Check if course already exists
            try {
                const existing = await pb.collection('courses').getFirstListItem(`originalId="${course.id}"`);
                if (existing) {
                    console.log(`Course ${course.title} already exists, skipping...`);
                    continue;
                }
            } catch (err) {
                // Not found, proceed
            }

            // Create course
            // Map the icon component to string name
            const iconName = (course.icon as any)?.displayName || (course.icon as any)?.name || 'Code';

            const courseData = {
                originalId: course.id,
                title: course.title,
                description: course.description,
                level: course.level,
                duration: course.duration,
                category: course.category,
                keywords: course.keywords,
                icon: iconName, // We need to handle this mapping in UI carefully
            };

            const createdCourse = await pb.collection('courses').create(courseData);
            console.log(`Created course: ${course.title}`);

            // Create chapters
            if (course.content && course.content.length > 0) {
                let order = 0;
                for (const chapter of course.content) {
                    const chapterData = {
                        course: createdCourse.id,
                        originalId: chapter.id,
                        title: chapter.title,
                        content: chapter.content,
                        duration: chapter.duration,
                        order: order++,
                        codeBlocks: chapter.codeBlocks || [],
                        infoBoxes: chapter.infoBoxes || [],
                    };
                    await pb.collection('chapters').create(chapterData);
                }
                console.log(`Created ${course.content.length} chapters for ${course.title}`);
            }

            results.success++;
        } catch (err: any) {
            console.error(`Failed to migrate course ${course.title}:`, err);
            results.failed++;
            results.errors.push(`${course.title}: ${err.message}`);
        }
    }

    return results;
};
