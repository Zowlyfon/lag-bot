import ServiceInterface from '../service.interface';
import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb';
import { Message } from 'discord.js';
import { QuoteCollection, QuoteDocument, quoteSchema } from '../schemas/quote.schema';
import { Service } from 'typedi';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb//plugins/pouchdb';
import { DisabledCommandGuildCollection, disabledCommandGuildSchema } from '../schemas/disabled-command-guild.schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const leveldown = require('leveldown');

type LagDatabaseCollections = {
    quotes: QuoteCollection;
    disabledcommandguilds: DisabledCommandGuildCollection;
};

type LagDatabase = RxDatabase<LagDatabaseCollections>;

@Service()
export default class DatabaseService implements ServiceInterface {
    private database: LagDatabase | undefined;

    async init() {
        addRxPlugin(RxDBDevModePlugin);
        addRxPlugin(RxDBQueryBuilderPlugin);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        addPouchPlugin(require('pouchdb-adapter-leveldb'));
        this.database = await createRxDatabase<LagDatabaseCollections>({
            name: 'database/lagdb',
            storage: getRxStoragePouch(leveldown),
        });

        if (this.database === undefined) return;

        await this.database.addCollections({
            quotes: {
                schema: quoteSchema,
            },
            disabledcommandguilds: {
                schema: disabledCommandGuildSchema,
            },
        });
    }

    async addQuote(message: Message, savedById: string): Promise<void> {
        if (this.database === undefined) return;
        if (message.guildId === null) return;

        await this.database.quotes.insert({
            userId: message.author.id,
            channelId: message.channelId,
            guildId: message.guildId,
            messageId: message.id,
            messageTimestamp: message.createdTimestamp.toString(10),
            content: message.content,
            savedById,
        });
    }

    async getQuotes(userId: string, channelId: string, guildId: string): Promise<QuoteDocument[]> {
        if (this.database === undefined) return [];

        return await this.database.quotes
            .find()
            .where('userId')
            .eq(userId)
            .where('channelId')
            .eq(channelId)
            .where('guildId')
            .eq(guildId)
            .exec();
    }

    async addDisabledCommand(guildId: string, command: string) {
        if (this.database === undefined) return;

        await this.database.disabledcommandguilds.insert({
            id: guildId + '|' + command,
            guildId,
            command,
        });
    }

    async removeDisabledCommand(guildId: string, command: string) {
        if (!this.database) return;

        const disabledCommand = await this.database.disabledcommandguilds
            .findOne()
            .where('id')
            .eq(guildId + '|' + command)
            .exec();

        if (disabledCommand) {
            return await disabledCommand.remove();
        }
        return false;
    }

    async getDisabledCommand(guildId: string, command: string) {
        if (this.database === undefined) return;

        return this.database.disabledcommandguilds
            .findOne()
            .where('guildId')
            .eq(guildId)
            .where('command')
            .eq(command)
            .exec();
    }

    async getDisabledCommands(guildId: string) {
        if (this.database === undefined) return [];

        return this.database.disabledcommandguilds.find().where('guildId').eq(guildId).exec();
    }
}
