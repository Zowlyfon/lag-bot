import ServiceInterface from '../service.interface';
import { Service } from 'typedi';
import { Message } from 'discord.js';
import DatabaseService from './database.service';

@Service()
export default class QuoteService implements ServiceInterface {

    constructor(private dbService: DatabaseService) {
    }

    init(): void {
        return;
    }

    async addQuote(message: Message, savedById: string) {
        await this.dbService.addQuote(message, savedById);
    }

    async getLastQuote(userId: string, channelId: string, guildId: string) {
        const messages = await this.dbService.getQuotes(userId, channelId, guildId);
        if (messages !== undefined) {
            return messages.reverse().pop();
        }
        return;
    }

    async getRandomQuote(userId: string, channelId: string, guildId: string) {
        const messages = await this.dbService.getQuotes(userId, channelId, guildId);
        if (messages !== undefined) {
            return messages[Math.floor(Math.random() * messages.length)];
        }
    }
}