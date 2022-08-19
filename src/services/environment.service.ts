import { Service } from 'typedi';
import dotenv from 'dotenv';

@Service()
export default class EnvironmentService {
    constructor() {
        dotenv.config();
    }

    getBotSecret(): string {
        const botSecret = process.env.BOT_SECRET;
        if (botSecret !== undefined) {
            return botSecret;
        }
        return '';
    }

    getClientId(): string {
        const clientId = process.env.CLIENT_ID;
        if (clientId !== undefined) {
            return clientId;
        }
        return '';
    }

    getGuildId(): string {
        const guildId = process.env.GUILD_ID;
        if (guildId !== undefined) {
            return guildId;
        }
        return '';
    }

    getGodId(): string {
        const godId = process.env.BOT_GOD;
        if (godId !== undefined) {
            return godId;
        }
        return '';
    }

    getWolframAlphaToken(): string {
        const wa = process.env.WOLFRAM_ALPHA;
        if (wa) {
            return wa;
        }
        return '';
    }
}
