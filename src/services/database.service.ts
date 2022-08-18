import ServiceInterface from '../service.interface';
import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb';
import { Message } from 'discord.js';
import { QuoteCollection, QuoteDocument, quoteSchema } from '../schemas/quote.schema';
import { Service } from 'typedi';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb//plugins/pouchdb';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const leveldown = require('leveldown')

type LagDatabaseCollections = {
    quotes: QuoteCollection
}

type LagDatabase = RxDatabase<LagDatabaseCollections>

@Service()
export default class DatabaseService implements ServiceInterface {
    private database: LagDatabase | undefined;

    async init() {
        addRxPlugin(RxDBDevModePlugin);
        addRxPlugin(RxDBQueryBuilderPlugin);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        addPouchPlugin(require('pouchdb-adapter-leveldb'))
        this.database = await createRxDatabase<LagDatabaseCollections>({
            name: 'lagdb',
            storage: getRxStoragePouch(leveldown)
        })

        if (this.database === undefined)
            return;

        await this.database.addCollections({
            quotes: {
                schema: quoteSchema
            }
        })
    }

    async addQuote(message: Message, savedById: string): Promise<void> {
        if (this.database === undefined)
            return;
        if (message.guildId === null)
            return;

        await this.database.quotes.insert({
            userId: message.author.id,
            channelId: message.channelId,
            guildId: message.guildId,
            messageId: message.id,
            messageTimestamp: message.createdTimestamp.toString(10),
            content: message.content,
            savedById
        });
    }

    async getQuotes(userId: string, channelId: string, guildId: string): Promise<QuoteDocument[]> {
        if (this.database === undefined)
            return [];

        return await this.database.quotes.find()
            .where('userId').eq(userId)
            .where('channelId').eq(channelId)
            .where('guildId').eq(guildId)
            .exec();
    }
}