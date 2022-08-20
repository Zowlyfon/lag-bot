import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import EnvironmentService from '../services/environment.service';
import axios from 'axios';

@Service()
export default class WolframAlphaCommand implements CommandInterface {
    command = 'wa';

    constructor(private env: EnvironmentService) {}

    async init() {
        return;
    }

    async runCommand(interaction: ChatInputCommandInteraction) {
        const query = interaction.options.getString('query');
        if (!query) return;

        const params = {
            appid: this.env.getWolframAlphaToken(),
            input: query,
            format: 'plaintext',
            output: 'JSON',
        };

        const searchParams = new URLSearchParams(params);

        await interaction.deferReply();

        const result = await axios({
            method: 'get',
            url: 'http://api.wolframalpha.com/v2/query?' + searchParams.toString(),
        });

        console.log('Search Result', result);

        if (!result) {
            await interaction.editReply('Computer said no');
            return;
        }

        if (result.status !== 200) {
            await interaction.editReply('Computer said no');
            return;
        }

        const answer = result.data;

        if (!answer.queryresult.success) {
            console.log('Wolfram Alpha Error', answer.queryresult.error);
            await interaction.editReply('Computer said no');
            return;
        }

        const podTexts: string[] = [];
        answer.queryresult.pods.forEach((pod: any) => {
            if (pod.id !== 'Input' && pod.primary === true) {
                const results: string[] = [];
                pod.subpods.forEach((subpod: any) => {
                    results.push(subpod.plaintext);
                });
                if (results.length > 0) {
                    podTexts.push('**' + pod.title + ':** ' + '\n' + results.join('\n'));
                }
            }
        });
        if (podTexts.length > 0) {
            const answerText = podTexts.join('\n\n');
            const queryParams = new URLSearchParams({ i: query });

            const embed = new EmbedBuilder()
                .setTitle(query)
                .setURL('https://www.wolframalpha.com/input?' + queryParams.toString())
                .setDescription(answerText)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            //await interaction.editReply(answerText + ' - ' + 'https://www.wolframalpha.com/input?' + queryParams.toString());
            return;
        }
        await interaction.editReply('Computer said no');
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Query wolfram alpha')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('query')
                    .setDescription('Query text')
                    .addStringOption((option) =>
                        option.setName('query').setDescription('The query text').setRequired(true),
                    ),
            );
    }
}
