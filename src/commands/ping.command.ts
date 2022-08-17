import DiscordService from '../services/discord.service';
import { Interaction } from 'discord.js';
import {Service} from 'typedi';
import CommandInterface from '../command.interface';

@Service()
export default class PingCommand implements CommandInterface {
    constructor(private discordService: DiscordService) {}

    init(): void {
        this.discordService.getInteractions().subscribe(async (interaction: (Interaction | undefined)) => {
            if (interaction !== undefined && interaction.isChatInputCommand()) {
                const { commandName } = interaction;

                if (commandName === 'ping') {
                    await interaction.reply('Pong!');
                }
            }
        });
    }
}