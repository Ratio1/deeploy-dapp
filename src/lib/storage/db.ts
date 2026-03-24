import { DraftJob, DraftProject } from '@typedefs/deeploys';
import { StackDraft } from '@typedefs/stacks';
import { Dexie, type EntityTable } from 'dexie';

const db = new Dexie('ratio1-deeploy') as Dexie & {
    projects: EntityTable<DraftProject, 'projectHash'>;
    jobs: EntityTable<DraftJob, 'id'>;
    stacks: EntityTable<StackDraft, 'id'>;
};

db.version(1).stores({
    projects: 'projectHash, name, createdAt',
    jobs: '++id, projectHash',
});

db.version(2).stores({
    projects: 'projectHash, name, createdAt',
    jobs: '++id, projectHash, stackId',
    stacks: 'id, projectHash, name, createdAt, updatedAt',
});

export default db;
