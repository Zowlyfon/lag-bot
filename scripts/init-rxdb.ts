import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/dist/types/plugins/dexie';

createRxDatabase({
    name: 'gnulagdb',
    storage: getRxStorageDexie()
}).then( async database => {
    const collections = database.addCollections({
        quotes: {
            schema: quoteSchema
        }
    })
});
