import { Job, Project } from '@typedefs/deeploys';
import { Dexie, type EntityTable } from 'dexie';

// Only declare properties you want to index
const db = new Dexie('Database') as Dexie & {
    projects: EntityTable<Project, 'id'>;
    jobs: EntityTable<Job, 'id'>;
};

db.version(1).stores({
    projects: '++id, name, createdAt',
    jobs: '++id, projectId',
});

export default db;
