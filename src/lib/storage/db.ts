import { DraftJob, DraftProject } from '@typedefs/deeploys';
import { Dexie, type EntityTable } from 'dexie';

// type Singletons = {
//     tunnelingSecrets: TunnelingSecrets;
// };

// type SingletonKey = keyof Singletons;

// type SingletonRecord<K extends SingletonKey = SingletonKey> = {
//     key: K;
//     value: Singletons[K];
// };

// Only declare properties you want to index
const db = new Dexie('ratio1-deeploy') as Dexie & {
    projects: EntityTable<DraftProject, 'projectHash'>;
    jobs: EntityTable<DraftJob, 'id'>;
    // singletons: EntityTable<SingletonRecord>;
};

db.version(1).stores({
    projects: 'projectHash, name, createdAt',
    jobs: '++id, projectHash',
    // singletons: '&key',
});

export default db;

// export async function setSingleton<K extends SingletonKey>(key: K, value: Singletons[K]) {
//     await db.singletons.put({ key, value });
// }

// export async function getSingleton<K extends SingletonKey>(key: K): Promise<Singletons[K] | undefined> {
//     const row = await db.singletons.where('key').equals(key).first();
//     return row?.value;
// }
