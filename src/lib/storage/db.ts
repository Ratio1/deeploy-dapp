import { Job, Project } from '@typedefs/deployment';
import { Dexie, type EntityTable } from 'dexie';

// Only declare properties you want to index
const db = new Dexie('Database') as Dexie & {
    projects: EntityTable<Project, 'id'>;
    jobs: EntityTable<Job, 'id'>;
};

db.version(1).stores({
    projects: '++id, name, datetime',
    jobs: '++id, projectId',
});

export default db;
