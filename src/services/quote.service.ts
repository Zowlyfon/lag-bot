import ServiceInterface from '../service.interface';
import { Service } from 'typedi';
import fs from 'fs';
import { Message, User } from 'discord.js';
import DatabaseService from './database.service';

@Service()
export default class QuoteService implements ServiceInterface {

    constructor(private dbService: DatabaseService) {
    }

    init(): void {
    }

    async addQuote(message: Message, savedById: string) {
        await this.dbService.addQuote(message, savedById);
    }

    async getLastQuote(userId: string, channelId: string, guildId: string) {
        const content = this.dbService.getQuote(userId, channelId, guildId);
        if (content !== undefined) {
            return content;
        }
        return;
    }
}