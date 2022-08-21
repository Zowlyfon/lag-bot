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
        let dice = 1;
        let diceMax = 100; // We probably don't want someone rolling a thousand dice.

        if (interaction.options.getSubcommand() === 'sides') {
            const sidesOption = interaction.options.getNumber('sides');
            if (sidesOption) {
                sides = Math.min(sidesOption);
            }
            const diceOption = interaction.options.getNumber('dice');
            if (diceOption) {
                dice = Math.min(Math.max(diceOption, 1), diceMax); // clamp between 1 and diceMax
            }
        }

        let rolls = [];
        for (let i = 0; i < dice; i++) {
            rolls.push(Math.floor(Math.random() * sides) + 1);
        }

        const total = rolls.reduce((rollsSum, r) => rollsSum + r, 0);

        if (dice == 1) {
            await interaction.reply(`You rolled ${rolls[0]} on a ${sides} sided die!`);
        } else {
            await interaction.reply(`You rolled ${dice} dice with ${sides} sides! Results: ${rolls.join(", ")}\nTotal of all roles: ${total}`);
        }
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Roll a dice')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('roll')
                    .setDescription('Rolls one or more dice with a user-defined number of sides.')
                    .addNumberOption((option) =>
                        option.setName('sides').setDescription('The number of sides').setRequired(true)
                    )
                    .addNumberOption((option) =>
                        option.setName('dice').setDescription('The number of dice').setRequired(false)
                    ),
            );
    }
}
