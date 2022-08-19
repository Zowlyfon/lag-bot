import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

@Service()
export default class DiceCommand implements CommandInterface {
    command = 'dice';
    async init() {
        return;
    }

    async runCommand(interaction: ChatInputCommandInteraction) {
        let sides = 6;
        if (interaction.options.getSubcommand() === 'sides') {
            const sidesOption = interaction.options.getNumber('sides');
            if (sidesOption) {
                sides = Math.min(sidesOption);
            }
        }
        const roll = Math.floor(Math.random() * sides) + 1;
        await interaction.reply('You rolled ' + roll + ' on a ' + sides + ' sided die!');
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Roll a dice')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('sides')
                    .setDescription('Set a number of sides')
                    .addNumberOption((option) =>
                        option.setName('sides').setDescription('The number of sides').setRequired(true),
                    ),
            );
    }
}
