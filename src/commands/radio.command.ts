import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    SelectMenuBuilder,
    SelectMenuOptionBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    VoiceBasedChannel,
} from 'discord.js';
import DiscordMusicService from '../services/discord-music.service';
import EnvironmentService from '../services/environment.service';
import { Song } from 'discord-music-player';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';

@Service()
export default class RadioCommand implements CommandInterface {
    command = 'radio';
    subCommands = new Array<SubCommand>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    constructor(private discordMusicService: DiscordMusicService, private env: EnvironmentService) {}

    async init() {
        this.subCommands.push(
            {
                command: 'play',
                runCommand: async (interaction) => {
                    const url = interaction.options.getString('url');

                    if (!url) return;

                    const member = interaction.member as GuildMember;

                    const voiceChannel = member.voice.channel;

                    if (!voiceChannel) return;

                    await interaction.deferReply();
                    const song = await this.discordMusicService.getSong(url, interaction.guildId as string);

                    if (!song) {
                        await interaction.editReply('Invalid URL');
                        return;
                    }

                    await this.playSong(interaction, song, voiceChannel);
                },
            },
            {
                command: 'search',
                runCommand: async (interaction) => {
                    const search = interaction.options.getString('search');

                    if (!search) return;

                    const member = interaction.member as GuildMember;

                    const voiceChannel = member.voice.channel;

                    if (!voiceChannel) return;

                    await interaction.deferReply();
                    await this.playSong(interaction, search, voiceChannel);
                },
            },
            {
                command: 'stop',
                runCommand: async (interaction) => {
                    this.discordMusicService.stop(interaction.guildId as string);
                    await interaction.reply('Bye Bye');
                },
            },
            {
                command: 'skip',
                runCommand: async (interaction) => {
                    this.discordMusicService.skip(interaction.guildId as string);
                    await interaction.reply('Skipping song...');
                },
            },
            {
                command: 'queue',
                runCommand: async (interaction) => {
                    const queue = this.discordMusicService.getQueue(interaction.guildId as string);

                    if (!queue) {
                        await interaction.reply('There is no queue');
                        return;
                    }

                    /*
                    let songs = 'Queue: ';
                    console.log('Queue', queue);
                    queue.songs.forEach((s) => {
                        songs = songs + s.name + '\n';
                    });
                     */

                    const songs = queue.songs.map((s) => {
                        return { name: s.author, value: s.name };
                    });

                    const embed = new EmbedBuilder().setTitle('Radio Queue').addFields(songs).setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                },
            },
            {
                command: 'set-volume',
                runCommand: async (interaction) => {
                    const volume = interaction.options.getNumber('volume');

                    if (!volume) return;

                    let override = false;

                    if (interaction.user.id === this.env.getGodId()) {
                        override = true;
                    }

                    if (this.discordMusicService.setVolume(interaction.guildId as string, volume, override)) {
                        await interaction.reply('Volume set to: ' + volume);
                        return;
                    }

                    await interaction.reply('Failed to set volume');
                },
            },
            {
                command: 'get-volume',
                runCommand: async (interaction) => {
                    const volume = this.discordMusicService.getVolume(interaction.guildId as string);

                    if (!volume) {
                        await interaction.reply('Radio is turned off');
                        return;
                    }

                    await interaction.reply('Volume is set to: ' + volume);
                },
            },
            {
                command: 'repeat',
                runCommand: async (interaction) => {
                    const repeat = interaction.options.getBoolean('repeat');

                    if (repeat === null) return;

                    const result = this.discordMusicService.repeat(interaction.guildId as string, repeat);

                    if (!result) {
                        await interaction.reply('No songs playing');
                        return;
                    }

                    await interaction.reply('Repeat set to ' + (repeat ? 'On' : 'Off'));
                },
            },
            {
                command: 'progress',
                runCommand: async (interaction) => {
                    const progressBar = this.discordMusicService.getProgress(interaction.guildId as string);

                    if (!progressBar) {
                        await interaction.reply('No song playing');
                        return;
                    }

                    await interaction.reply(progressBar.toString());
                },
            },
            {
                command: 'remove',
                runCommand: async (interaction) => {
                    const queue = this.discordMusicService.getQueue(interaction.guildId as string);

                    if (!queue) {
                        await interaction.reply('No songs in queue');
                        return;
                    }

                    const songs = queue.songs;

                    const songSelect = new SelectMenuBuilder().setCustomId('removeSongSelect');

                    const options = songs.map((s) => {
                        return new SelectMenuOptionBuilder().setLabel(s.name);
                    });

                    songSelect.addOptions(options);
                },
            },
        );
    }

    async runCommand(interaction: ChatInputCommandInteraction) {
        if (!interaction.member) return;
        if (!interaction.guildId) return;
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
            )
            .addSubcommand((subcommand) =>
                subcommand.setName('progress').setDescription('Get the progress of the current song'),
            )
            .addSubcommand((subcommand) => subcommand.setName('remove').setDescription('Remove song from queue'));
    }

    async playSong(interaction: ChatInputCommandInteraction, search: string | Song, voiceChannel: VoiceBasedChannel) {
        if (!interaction.guildId) return;

        const song = await this.discordMusicService.addToQueue(search, interaction.guildId, voiceChannel);

        if (!song) {
            await interaction.editReply('Song failed to play');
            return;
        }

        return await interaction.editReply(`Song added to queue: ${song.name}`);
    }
}
