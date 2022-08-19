import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import DiscordMusicService from '../services/discord-music.service';

@Service()
export default class RadioCommand implements CommandInterface {
    command = 'radio';

    constructor(private discordMusicService: DiscordMusicService) {}

    async init() {
        return;
    }

    async runCommand(interaction: ChatInputCommandInteraction) {
        if (interaction.options.getSubcommand() === 'play') {
            console.log('radio player');
            const url = interaction.options.getString('url');

            if (!url) return;
            if (!interaction.member) return;
            if (!interaction.guildId) return;

            const member = interaction.member as GuildMember;

            const voiceChannel = member.voice.channel;

            if (!voiceChannel) return;

            await interaction.deferReply();
            await this.discordMusicService.addToQueue(url, interaction.guildId, voiceChannel);
            await interaction.editReply('Playing song');
        }
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Play music from youtube')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('play')
                    .setDescription('Choose a song to play')
                    .addStringOption((option) => option.setName('url').setDescription('Youtube url').setRequired(true)),
            );
    }
}
