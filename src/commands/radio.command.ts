import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import DiscordMusicService from '../services/discord-music.service';
import EnvironmentService from '../services/environment.service';

@Service()
export default class RadioCommand implements CommandInterface {
    command = 'radio';

    constructor(private discordMusicService: DiscordMusicService, private env: EnvironmentService) {}

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
            const song = await this.discordMusicService.getSong(url, interaction.guildId);

            if (!song) {
                await interaction.editReply('Invalid URL');
                return;
            }

            const songPlaying = await this.discordMusicService.addToQueue(song, interaction.guildId, voiceChannel);

            if (!songPlaying) {
                await interaction.editReply('Song failed to play');
                return;
            }

            await interaction.editReply('Playing song: ' + song.name);
        }

        if (interaction.options.getSubcommand() === 'search') {
            console.log('radio search');
            const search = interaction.options.getString('search');

            if (!search) return;

            const member = interaction.member as GuildMember;

            const voiceChannel = member.voice.channel;

            if (!voiceChannel) return;

            await interaction.deferReply();
            const song = await this.discordMusicService.addToQueue(search, interaction.guildId, voiceChannel);

            if (!song) {
                await interaction.editReply('Song failed to play');
                return;
            }

            await interaction.editReply('Playing song: ' + song.name);
        }

        if (interaction.options.getSubcommand() === 'stop') {
            console.log('radio stop');
            this.discordMusicService.stop(interaction.guildId);
            await interaction.reply('Bye Bye');
        }

        if (interaction.options.getSubcommand() === 'skip') {
            console.log('radio skip');
            this.discordMusicService.skip(interaction.guildId);
            await interaction.reply('Skipping song...');
        }

        if (interaction.options.getSubcommand() === 'queue') {
            console.log('radio queue');
            const queue = this.discordMusicService.getQueue(interaction.guildId);

            if (!queue) {
                await interaction.reply('There is no queue');
                return;
            }

            let songs = 'Queue: ';
            console.log('Queue', queue);
            queue.songs.forEach((s) => {
                songs = songs + s.name + '\n';
            });

            await interaction.reply(songs);
        }

        if (interaction.options.getSubcommand() === 'set-volume') {
            console.log('radio set-volume');

            const volume = interaction.options.getNumber('volume');

            if (!volume) return;

            let override = false;

            if (interaction.user.id === this.env.getGodId()) {
                override = true;
            }

            if (this.discordMusicService.setVolume(interaction.guildId, volume, override)) {
                await interaction.reply('Volume set to: ' + volume);
                return;
            }

            await interaction.reply('Failed to set volume');
        }

        if (interaction.options.getSubcommand() === 'get-volume') {
            console.log('radio get-volume');

            const volume = this.discordMusicService.getVolume(interaction.guildId);

            if (!volume) {
                await interaction.reply('Radio is turned off');
                return;
            }

            await interaction.reply('Volume is set to: ' + volume);
        }

        if (interaction.options.getSubcommand() === 'repeat') {
            console.log('radio repeat');

            const repeat = interaction.options.getBoolean('repeat');

            if (repeat === null) return;

            const result = this.discordMusicService.repeat(interaction.guildId, repeat);

            if (!result) {
                await interaction.reply('No songs playing');
                return;
            }

            await interaction.reply('Repeat set to ' + (repeat ? 'On' : 'Off'));
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
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('search')
                    .setDescription('Search for a song to play')
                    .addStringOption((option) =>
                        option.setName('search').setDescription('Search terms').setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('set-volume')
                    .setDescription('Set the music volume')
                    .addNumberOption((option) =>
                        option.setName('volume').setDescription('Volume to set').setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName('get-volume').setDescription('Get the current music volume'),
            )
            .addSubcommand((subcommand) => subcommand.setName('stop').setDescription('Stop playing music'))
            .addSubcommand((subcommand) => subcommand.setName('skip').setDescription('Skip the current song'))
            .addSubcommand((subcommand) => subcommand.setName('queue').setDescription('Get the music queue'))
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('repeat')
                    .setDescription('Set the current song to repeat')
                    .addBooleanOption((option) => option.setName('on').setDescription('Repeat on or off')),
            );
    }
}
