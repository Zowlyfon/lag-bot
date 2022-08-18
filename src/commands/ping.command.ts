import DiscordService from '../services/discord.service';
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
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

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');
    }
}