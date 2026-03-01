#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const targetPath = path.join(projectRoot, 'public', 'custom_courses.json');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function ensureArrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.courses)) return payload.courses;
  throw new Error('Format invalide. Le fichier source doit être un tableau de cours ou un objet { courses: [...] }.');
}

function sanitizeCourse(course, index) {
  if (!course || typeof course !== 'object') {
    throw new Error(`Cours #${index + 1}: objet invalide.`);
  }

  const id = String(course.id || '').trim();
  const title = String(course.title || '').trim();

  if (!id) throw new Error(`Cours #${index + 1}: champ "id" obligatoire.`);
  if (!title) throw new Error(`Cours #${index + 1}: champ "title" obligatoire.`);

  return {
    ...course,
    id,
    title,
    description: String(course.description || 'Cours personnalisé importé.'),
    level: String(course.level || 'intermediate'),
    duration: String(course.duration || 'N/A'),
    category: String(course.category || 'forge'),
    keywords: Array.isArray(course.keywords) ? course.keywords.map((kw) => String(kw)) : [],
    content: Array.isArray(course.content) ? course.content : course.content,
    quiz: Array.isArray(course.quiz) ? course.quiz : [],
  };
}

function mergeCourses(existingCourses, incomingCourses) {
  const byId = new Map();
  for (const item of existingCourses) {
    if (item?.id) byId.set(String(item.id), item);
  }
  for (const item of incomingCourses) {
    byId.set(String(item.id), item);
  }
  return Array.from(byId.values());
}

function main() {
  const sourceArg = process.argv[2];
  if (!sourceArg) {
    console.log('Usage: node scripts/import-custom-courses.cjs <path-vers-fichier-json>');
    process.exit(1);
  }

  const sourcePath = path.resolve(process.cwd(), sourceArg);
  if (!fs.existsSync(sourcePath)) {
    console.error(`[import-custom-courses] Fichier introuvable: ${sourcePath}`);
    process.exit(1);
  }

  let sourcePayload;
  try {
    sourcePayload = readJson(sourcePath);
  } catch (err) {
    console.error(`[import-custom-courses] JSON source invalide: ${err.message}`);
    process.exit(1);
  }

  const incomingRaw = ensureArrayPayload(sourcePayload);
  const incoming = incomingRaw.map((course, index) => sanitizeCourse(course, index));

  let current = { metadata: {}, courses: [] };
  if (fs.existsSync(targetPath)) {
    try {
      const parsed = readJson(targetPath);
      current = {
        metadata: parsed?.metadata || {},
        courses: Array.isArray(parsed?.courses) ? parsed.courses : [],
      };
    } catch {
      current = { metadata: {}, courses: [] };
    }
  }

  const mergedCourses = mergeCourses(current.courses, incoming);

  const finalPayload = {
    metadata: {
      version: String(current.metadata?.version || '1.0.0'),
      updatedAt: new Date().toISOString(),
      description: 'Cours personnalisés chargés automatiquement au runtime',
      count: mergedCourses.length,
    },
    courses: mergedCourses,
  };

  fs.writeFileSync(targetPath, JSON.stringify(finalPayload, null, 2) + '\n', 'utf8');

  console.log(`[import-custom-courses] Import terminé.`);
  console.log(`[import-custom-courses] Source: ${sourcePath}`);
  console.log(`[import-custom-courses] Cours importés: ${incoming.length}`);
  console.log(`[import-custom-courses] Total dans custom_courses.json: ${mergedCourses.length}`);
  console.log(`[import-custom-courses] Fichier cible: ${targetPath}`);
}

main();
