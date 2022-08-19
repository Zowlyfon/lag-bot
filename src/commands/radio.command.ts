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
        if (!interaction.member) return;
        if (!interaction.guildId) return;

        if (interaction.options.getSubcommand() === 'play') {
            console.log('radio play');
            const url = interaction.options.getString('url');

            if (!url) return;

            const member = interaction.member as GuildMember;

            const voiceChannel = member.voice.channel;

            if (!voiceChannel) return;

            await interaction.deferReply();
            const song = await this.discordMusicService.addToQueue(url, interaction.guildId, voiceChannel);

            if (!song) {
                await interaction.editReply('Song failed to play');
                return;
            }

            await interaction.editReply('Playing song: ' + song.name);
        }

        if (interaction.options.getSubcommand() === 'stop') {
            console.log('radio stop');
            this.discordMusicService.stop(interaction.guildId);
            interaction.reply('Bye Bye');
        }

        if (interaction.options.getSubcommand() === 'skip') {
            console.log('radio skip');
            this.discordMusicService.skip(interaction.guildId);
            interaction.reply('Skipping song...');
        }

        if (interaction.options.getSubcommand() === 'queue') {
            console.log('radio queue');
            const queue = this.discordMusicService.getQueue(interaction.guildId);

            if (!queue) {
                interaction.reply('There is no queue');
                return;
            }

            let songs = 'Queue: ';
            console.log('Queue', queue);
            queue.songs.forEach((s) => {
                songs = songs + s.name + '\n';
            });

            interaction.reply(songs);
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
            )
            .addSubcommand((subcommand) => subcommand.setName('stop').setDescription('Stop playing music'))
            .addSubcommand((subcommand) => subcommand.setName('skip').setDescription('Skip the current song'))
            .addSubcommand((subcommand) => subcommand.setName('queue').setDescription('Get the music queue'));
    }
}
