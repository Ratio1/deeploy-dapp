import { Project } from '@typedefs/deployment';
import { Dexie, type EntityTable } from 'dexie';

const db = new Dexie('Database') as Dexie & {
    projects: EntityTable<Project, 'id'>;
};

db.version(1).stores({
    projects: '++id, name, color, datetime',
});

export default db;
