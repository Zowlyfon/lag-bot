import ServiceInterface from '../service.interface';
import DiscordService from './discord.service';
import { Service } from 'typedi';
import { Player } from 'discord-music-player';
import { VoiceBasedChannel } from 'discord.js';

//

@Service()
export default class DiscordMusicService implements ServiceInterface {
    private player: Player;
    constructor(private discordService: DiscordService) {
        this.player = new Player(this.discordService.getClient());
    }

    init() {
        return;
    }

    async addToQueue(url: string, guildId: string, voiceChannel: VoiceBasedChannel) {
        const guildQueue = this.player.getQueue(guildId);
        const queue = this.player.createQueue(guildId);
        await queue.join(voiceChannel);
        console.log('Trying to play: ', url);
        try {
            const song = await queue.play(url);
            return song;
        } catch (e) {
            console.error(e);
            return;
        }
    }

    stop(guildId: string) {
        const guildQueue = this.player.getQueue(guildId);
        if (!guildQueue) return;
        guildQueue.stop();
    }

    skip(guildId: string) {
        const guildQueue = this.player.getQueue(guildId);
        if (!guildQueue) return;
        guildQueue.skip();
    }

    getQueue(guildId: string) {
        return this.player.getQueue(guildId);
    }
}
