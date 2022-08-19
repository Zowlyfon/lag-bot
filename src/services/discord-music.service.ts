import ServiceInterface from '../service.interface';
import DiscordService from './discord.service';
import { Service } from 'typedi';
import { Player } from 'discord-music-player';
import { VoiceBasedChannel } from 'discord.js';

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
        try {
            console.log('Trying to play: ', url);
            await queue.play(url);
        } catch (e) {
            console.error('Error Playing Music: ', e);
            if (!guildQueue) queue.stop();
        }
    }
}
