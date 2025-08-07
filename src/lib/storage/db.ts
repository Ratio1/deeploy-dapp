import { DraftJob, DraftProject } from '@typedefs/deeploys';
import { Dexie, type EntityTable } from 'dexie';

// Only declare properties you want to index
const db = new Dexie('Database') as Dexie & {
    projects: EntityTable<DraftProject, 'id'>;
    jobs: EntityTable<DraftJob, 'id'>;
};

db.version(1).stores({
    projects: '++id, name, createdAt, projectHash',
    jobs: '++id, projectHash',
});

export default db;
