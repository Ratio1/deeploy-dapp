import { DraftJob, DraftProject } from '@typedefs/deeploys';
import { Dexie, type EntityTable } from 'dexie';

const db = new Dexie('ratio1-deeploy') as Dexie & {
    projects: EntityTable<DraftProject, 'projectHash'>;
    jobs: EntityTable<DraftJob, 'id'>;
};

db.version(1).stores({
    projects: 'projectHash, name, createdAt',
    jobs: '++id, projectHash',
});

export default db;
