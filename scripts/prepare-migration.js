import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/data/courses/index.ts');
let content = fs.readFileSync(inputPath, 'utf8');

// Remove type imports
content = content.replace(/import type .*?;/g, '');

// Mock lucide-react imports
content = content.replace(/import\s+\{(.*?)\}\s+from\s+'lucide-react';/, (match, imports) => {
    const names = imports.split(',').map(n => n.trim()).filter(n => n);
    return names.map(n => `const ${n} = "${n}";`).join('\n');
});

content = content.replace(/import .*? from '\.\.\/.*?';/g, '');
content = content.replace(/export const/g, 'const');
content = content.replace(/\/\/ @ts-nocheck/g, '');

const migrationLogic = `
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
    console.log("Starting full migration (Schema + Data)...");
    try {
        try {
           await pb.collection('_superusers').authWithPassword('admin@tutodecode.com', '1234567890');
           console.log("Authenticated as superuser.");
        } catch (e: any) {
           console.log("Authentication failed. Ensure superuser exists.");
           process.exit(1);
        }

        // Create 'courses' collection
        try {
            await pb.collections.create({
                name: "courses",
                type: "base",
                schema: [
                    { name: "originalId", type: "text", required: true, unique: true },
                    { name: "title", type: "text", required: true },
                    { name: "description", type: "text" },
                    { name: "level", type: "select", options: { values: ["beginner", "intermediate", "advanced"] } },
                    { name: "duration", type: "text" },
                    { name: "category", type: "text" }, 
                    { name: "keywords", type: "json" }, 
                    { name: "icon", type: "text" }, 
                    { name: "image", type: "file", options: { mimeTypes: ["image/png","image/jpeg"], maxSelect: 1 } },
                    { name: "chaptersCount", type: "number" },
                ],
                listRule: "", // Public
                viewRule: "", // Public
            });
            console.log("Created 'courses' collection.");
        } catch (e: any) {
            // console.log("Courses collection setup: " + e.message);
        }

        // Create 'chapters' collection
        let coursesId = "";
        try {
            const c = await pb.collections.getOne("courses");
            coursesId = c.id;
        } catch(e) {}

        if (coursesId) {
            try {
                await pb.collections.create({
                    name: "chapters",
                    type: "base",
                    schema: [
                        { name: "course", type: "relation", required: true, options: { 
                            collectionId: coursesId,
                            cascadeDelete: true,
                            maxSelect: 1
                        }},
                        { name: "originalId", type: "text", required: true },
                        { name: "title", type: "text", required: true },
                        { name: "content", type: "text" }, // Markdown content
                        { name: "duration", type: "text" },
                        { name: "order", type: "number" },
                        { name: "codeBlocks", type: "json" }, 
                        { name: "infoBoxes", type: "json" }, 
                    ],
                    listRule: "", // Public
                    viewRule: "", // Public
                });
                console.log("Created 'chapters' collection.");
            } catch (e: any) {
                // console.log("Chapters collection setup: " + e.message);
            }
        }
        
        // Data Import
        const coursesData = courses;
        
        for (const course of coursesData) {
            try {
               const exist = await pb.collection('courses').getFirstListItem(\`originalId="\${course.id}"\`);
               if(exist) {
                   console.log(\`Skipping existing course: \${course.title}\`);
                   continue;
               }
            } catch(e) {}

            console.log(\`Migrating course: \${course.title}\`);
            const coursePayload = {
                originalId: course.id,
                title: course.title,
                description: course.description,
                level: course.level,
                duration: course.duration,
                category: course.category,
                keywords: course.keywords,
                icon: course.icon, 
                chaptersCount: course.chapters || 0
            };
            
            try {
                const rec = await pb.collection('courses').create(coursePayload);
                
                if (course.content && course.content.length > 0) {
                    let order = 0;
                    for(const chap of course.content) {
                        try {
                            await pb.collection('chapters').create({
                               course: rec.id,
                               originalId: chap.id,
                               title: chap.title,
                               content: chap.content,
                               duration: chap.duration,
                               order: order++,
                               codeBlocks: chap.codeBlocks || [],
                               infoBoxes: chap.infoBoxes || [] 
                            });
                        } catch(err: any) {
                            console.error(\`Failed to create chapter \${chap.title}: \`, err.data || err.message);
                        }
                    }
                    console.log(\`  - Migrated \${course.content.length} chapters.\`);
                }
            } catch (err: any) {
                console.error(\`Failed to create course \${course.title}: \`, err.data || err.message);
            }
        }
        console.log("Migration complete.");
        
    } catch(e: any) { 
        console.error("Migration fatal error:", e); 
    }
}

run();
`;

const finalScript = content + '\n' + migrationLogic;
const dest = path.join(__dirname, 'temp_run_migration.ts');
fs.writeFileSync(dest, finalScript);
console.log(`Generated migration script at ${dest}`);
