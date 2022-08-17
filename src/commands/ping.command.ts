import DiscordService from '../services/discord.service';
import { Interaction } from 'discord.js';
import {Service} from 'typedi';
import CommandInterface from '../command.interface';

@Service()
export default class PingCommand implements CommandInterface {
    command = 'ping';
    constructor(private discordService: DiscordService) {}

    init(): void {
        this.discordService.onChatCommand(this.command).subscribe(async interaction => {
            await interaction.reply('Pong!');
        })
    }
}