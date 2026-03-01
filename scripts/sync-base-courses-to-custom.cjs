#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const sourceTs = path.join(projectRoot, 'src', 'data', 'courses', 'source_data.ts');
const targetJson = path.join(projectRoot, 'public', 'custom_courses.json');

function loadBaseCoursesFromTs() {
  const source = fs.readFileSync(sourceTs, 'utf8');

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      removeComments: false,
    },
    fileName: sourceTs,
  }).outputText;

  const moduleObj = { exports: {} };
  const sandbox = {
    module: moduleObj,
    exports: moduleObj.exports,
    require: (id) => {
      if (id === 'lucide-react') {
        return new Proxy({}, { get: () => null });
      }
      if (id.startsWith('../../types')) {
        return {};
      }
      return require(id);
    },
    __dirname: path.dirname(sourceTs),
    __filename: sourceTs,
    console,
    process,
  };

  vm.runInNewContext(transpiled, sandbox, { filename: sourceTs });
  const exported = moduleObj.exports;
  const courses = Array.isArray(exported.courses) ? exported.courses : [];
  return courses;
}

function sanitizeCourse(course) {
  const content = Array.isArray(course.content)
    ? course.content.map((section, index) => ({
        id: String(section?.id || `section-${index + 1}`),
        title: String(section?.title || `Section ${index + 1}`),
        duration: String(section?.duration || '45min'),
        content: String(section?.content || ''),
      }))
    : [];

  const quiz = Array.isArray(course.quiz)
    ? course.quiz
        .filter((q) => q && q.id && q.question && Array.isArray(q.options))
        .map((q) => ({
          id: String(q.id),
          question: String(q.question),
          options: q.options.map((opt) => String(opt)).slice(0, 4),
          correctAnswer: Number(q.correctAnswer ?? 0),
          explanation: String(q.explanation || 'Réponse validée.'),
        }))
    : [];

  return {
    id: String(course.id || '').trim(),
    title: String(course.title || '').trim(),
    description: String(course.description || 'Cours importé.'),
    level: String(course.level || 'intermediate'),
    duration: String(course.duration || 'N/A'),
    category: String(course.category || 'forge'),
    keywords: Array.isArray(course.keywords) ? course.keywords.map((kw) => String(kw)) : [],
    content,
    quiz,
  };
}

function main() {
  const baseCourses = loadBaseCoursesFromTs()
    .map(sanitizeCourse)
    .filter((c) => c.id && c.title);

  const payload = {
    metadata: {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      description: 'Cours personnalisés chargés automatiquement au runtime',
      count: baseCourses.length,
    },
    courses: baseCourses,
  };

  if (fs.existsSync(targetJson)) {
    fs.copyFileSync(targetJson, `${targetJson}.pre-sync.bak`);
  }

  fs.writeFileSync(targetJson, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`[sync-base-courses] ${baseCourses.length} cours écrits dans ${targetJson}`);
}

main();
