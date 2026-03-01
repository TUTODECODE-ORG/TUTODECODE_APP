# ⚠️ IMPORTANT - COURSE CONTENT

## This Directory is a TEMPLATE ONLY

The `src/data/courses/` directory is intentionally empty in the open source distribution.

### What's Included (Open Source - MIT with Attribution)
- ✅ `index.ts` - Empty template file showing the expected structure

### What's NOT Included (Proprietary)
- ❌ All course content files (*.ts, *.tsx)
- ❌ Educational materials
- ❌ Lesson text and explanations
- ❌ Course-specific examples

## For Open Source Users

You are free to create your OWN course content using this framework!

Example of creating a course:

```typescript
// src/data/courses/my-course.ts
import { Course } from '@/types';

export const myCourse: Course = {
  id: 'my-course',
  title: 'My Custom Course',
  description: 'Your course description',
  level: 'beginner',
  duration: '2h',
  category: 'web',
  keywords: ['html', 'css'],
  content: [
    {
      id: 'intro',
      title: 'Introduction',
      content: 'Your lesson content here...',
      duration: '30min'
    }
  ]
};
```

Then import it in `index.ts`:
```typescript
import { myCourse } from './my-course';

export const courses = [myCourse];
```

## For TutoDecode Course Purchasers

If you have purchased courses from TutoDecode:
1. Place your purchased course files in this directory
2. They will automatically be loaded by the application
3. Your course files are protected and will not be committed to Git (see `.gitignore`)

---

**Copyright Notice:**
- Framework code: MIT License with Attribution (Open Source)
- Course content: © 2024-2026 Winancher - TutoDecode (All Rights Reserved)
