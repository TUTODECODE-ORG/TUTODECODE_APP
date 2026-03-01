import Dexie, { type Table } from 'dexie';

export interface CourseProgress {
    id: string; // Course slug or ID
    completed: boolean;
    completedAt?: Date;
    lastViewed: Date;
    notes?: string;
    isFavorite: boolean;
    score?: number;
}

export class TutoDecodeDB extends Dexie {
    progress!: Table<CourseProgress>;

    constructor() {
        super('TutoDecodeV3');
        this.version(1).stores({
            progress: 'id, completed, lastViewed, isFavorite'
        });
    }

    async setProgress(p: Partial<CourseProgress> & { id: string }) {
        return this.progress.put({
            completed: false,
            isFavorite: false,
            lastViewed: new Date(),
            ...p
        } as CourseProgress);
    }

    async getProgress(id: string) {
        return this.progress.get(id);
    }

    async getAllProgress() {
        return this.progress.toArray();
    }

    // Portability: Export JSON
    async exportData() {
        const data = await this.getAllProgress();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tutodecode-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }

    // Portability: Import JSON
    async importData(jsonString: string) {
        try {
            const data = JSON.parse(jsonString);
            await this.progress.bulkPut(data);
            return true;
        } catch (e) {
            console.error('Import failed', e);
            return false;
        }
    }
}

export const db = new TutoDecodeDB();
