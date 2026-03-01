import { useEffect } from 'react';
import type { Course } from '@/types';

interface UseSEOProps {
    title?: string;
    description?: string;
    course?: Course;
    keywords?: string[];
}

/**
 * Hook pour gérer les métadonnées SEO dynamiques
 */
export function useSEO({ title, description, course, keywords }: UseSEOProps = {}) {
    useEffect(() => {
        // Update title
        if (title) {
            document.title = `${title} | Ghost Framework`;
        } else if (course) {
            document.title = `${course.title} - Free Course | Ghost Framework`;
        } else {
            document.title = 'Ghost Framework - Open Source Learning Platform';
        }

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            const desc = description || course?.description ||
                'Open Source Learning Framework: Create your own offline-first educational platform.';
            metaDescription.setAttribute('content', desc);
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');

        if (ogTitle) {
            ogTitle.setAttribute('content', document.title);
        }
        if (ogDescription) {
            const desc = description || course?.description || '';
            ogDescription.setAttribute('content', desc);
        }

        // Update keywords if provided
        if (keywords || course?.keywords) {
            let keywordsMeta = document.querySelector('meta[name="keywords"]');
            if (!keywordsMeta) {
                keywordsMeta = document.createElement('meta');
                keywordsMeta.setAttribute('name', 'keywords');
                document.head.appendChild(keywordsMeta);
            }

            const keywordsList = keywords || course?.keywords || [];
            keywordsMeta.setAttribute('content', keywordsList.join(', '));
        }

        // Add canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }

        const baseUrl = 'https://ghost-framework.com';
        const path = course ? `/${course.id}` : '';
        canonical.setAttribute('href', `${baseUrl}${path}`);

    }, [title, description, course, keywords]);
}

/**
 * Generate JSON-LD structured data for a course
 */
export function generateCourseStructuredData(course: Course): string {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Course',
        'name': course.title,
        'description': course.description,
        'provider': {
            '@type': 'Organization',
            'name': 'Ghost Framework',
            'url': 'https://ghost-framework.com'
        },
        'educationalLevel': course.level,
        'timeRequired': course.duration,
        'numberOfCredits': course.chapters,
        'courseCode': course.id,
        'keywords': course.keywords.join(', '),
        'inLanguage': 'fr',
        'isAccessibleForFree': 'True',
        'availableOnline': true
    });
}

/**
 * Add structured data to page
 */
export function addStructuredData(data: string, id: string = 'course-structured-data') {
    // Remove existing
    const existing = document.getElementById(id);
    if (existing) {
        existing.remove();
    }

    // Add new
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = data;
    document.head.appendChild(script);
}

/**
 * Remove structured data
 */
export function removeStructuredData(id: string = 'course-structured-data') {
    const existing = document.getElementById(id);
    if (existing) {
        existing.remove();
    }
}
