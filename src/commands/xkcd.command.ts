import CommandInterface from '../command.interface';
import { SubCommand } from '../sub-command.type';
import { InteractionHandler } from '../interaction-handler.type';
import { Subject } from 'rxjs';
import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import axios from 'axios';
import { Service } from 'typedi';

@Service()
export default class XkcdCommand implements CommandInterface {
    command = 'xkcd';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    async init(): Promise<void> {
        this.subCommands.push(
            {
                command: 'today',
                runCommand: async (interaction) => {
                    await interaction.deferReply();
                    try {
                        const xkcd = await axios.get('https://xkcd.com/info.0.json');
                        return await this.sendXkcd(xkcd, interaction);
                    } catch (e) {
                        console.error(e);
                        await interaction.editReply('Could not fetch xkcd :(');
                        return;
                    }
                },
            },
            {
                command: 'rand',
                runCommand: async (interaction) => {
                    await interaction.deferReply();
                    try {
                        const today = await axios.get('https://xkcd.com/info.0.json');
                        const max = today.data.num;
                        const xkcdNum = Math.floor(Math.random() * max) + 1;
                        const xkcd = await axios.get(`https://xkcd.com/${xkcdNum}/info.0.json`);
                        return await this.sendXkcd(xkcd, interaction);
                    } catch (e) {
                        console.error(e);
                        await interaction.editReply('Could not fetch xkcd :(');
                        return;
                    }
                },
            },
            {
                command: 'get',
                runCommand: async (interaction) => {
                    const xkcdNum = interaction.options.getString('number');
                    if (!xkcdNum) return;
                    try {
                        await interaction.deferReply();
                        const xkcd = await axios.get(`https://xkcd.com/${xkcdNum}/info.0.json`);
                        return await this.sendXkcd(xkcd, interaction);
                    } catch (e) {
                        console.error(e);
                        await interaction.editReply('Could not fetch xkcd :(');
                        return;
                    }
                },
            },
        );
    }

    async runCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        return;
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Your favourite nerd comics!')
            .addSubcommand((subcommand) => subcommand.setName('today').setDescription('Get the latest xkcd'))
            .addSubcommand((subcommand) => subcommand.setName('rand').setDescription('Get a random xkcd'))
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('get')
                    .setDescription('Get a specific xkcd')
                    .addStringOption((option) =>
                        option.setName('number').setDescription('The xkcd to grab').setRequired(true),
                    ),
            );
    }

    async sendXkcd(xkcd: any, interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setTitle(`${xkcd.data.safe_title} ${xkcd.data.year}-${xkcd.data.month}-${xkcd.data.day} ${xkcd.data.num}`)
            .setURL(`https://xkcd.com/${xkcd.data.num}`)
            .setDescription(xkcd.data.alt)
            .setImage(xkcd.data.img)
            .setColor(Colors.Green);
        await interaction.editReply({ embeds: [embed] });
    }
}
