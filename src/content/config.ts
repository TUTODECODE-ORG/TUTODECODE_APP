// @ts-ignore
import { defineCollection, z } from 'astro:content';

const courses = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date().or(z.string()),
        level: z.enum(['Débutant', 'Intermédiaire', 'Avancé', 'Expert']),
        duration: z.string(), // e.g., "40h"
        category: z.string(),
        roadmap: z.enum(['DevOps', 'Fullstack', 'Security']),
        tags: z.array(z.string()).default([]),
        author: z.string().default('TutoDecode'),
        draft: z.boolean().default(false),
        videoUrl: z.string().optional(),
        resources: z.array(z.object({
            name: z.string(),
            url: z.string(),
        })).default([]),
    }),
});

export const collections = {
    'courses': courses,
};
