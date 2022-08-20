import ServiceInterface from '../service.interface';
import DiscordService from './discord.service';
import { Service } from 'typedi';
import { Player, Queue, Song, Utils } from 'discord-music-player';
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

    async getSong(url: string, guildId: string) {
        const guildQueue = this.player.getQueue(guildId);
        let queue: Queue;
        if (!guildQueue) {
            queue = this.player.createQueue(guildId);
        } else {
            queue = guildQueue;
        }

        return Utils.link(url, {}, queue);
    }

    async addToQueue(songQuery: string | Song, guildId: string, voiceChannel: VoiceBasedChannel) {
        const queue = this.player.createQueue(guildId);
        await queue.join(voiceChannel);
        console.log('Trying to play: ', songQuery);
        try {
            return await queue.play(songQuery);
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

    setVolume(guildId: string, volume: number, override: boolean) {
        const guildQueue = this.player.getQueue(guildId);
        if (!guildQueue) return;

        if (!override) volume = Math.max(Math.min(volume, 200), 0);

        return guildQueue.setVolume(volume);
    }

    getVolume(guildId: string) {
        const guildQueue = this.player.getQueue(guildId);
        if (!guildQueue) return;
        return guildQueue.volume;
    }
}
