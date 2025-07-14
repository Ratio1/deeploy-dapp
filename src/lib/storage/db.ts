import { Project } from '@typedefs/deployment';
import { Dexie, type EntityTable } from 'dexie';

const db = new Dexie('Database') as Dexie & {
    projects: EntityTable<Project, 'id'>;
};

db.version(1).stores({
    projects: '++id, name, color, datetime',
});

db.version(2)
    .stores({
        projects: '++id, name, color, datetime, jobs',
    })
    .upgrade((tx) => {
        // Add empty jobs array to existing projects
        return tx
            .table('projects')
            .toCollection()
            .modify((project) => {
                project.jobs = [];
            });
    });

export default db;
