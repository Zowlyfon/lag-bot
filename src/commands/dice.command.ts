import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';
import { InteractionHandler } from '../interaction-handler.type';

@Service()
export default class DiceCommand implements CommandInterface {
    command = 'dice';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    async init() {
        this.subCommands.push({
            command: 'roll',
            runCommand: async (interaction) => {
                let sides = 6;
                let dice = 1;

                const sidesOption = interaction.options.getNumber('sides');
                if (sidesOption) {
                    sides = Math.min(sidesOption);
                }
                const diceOption = interaction.options.getNumber('dice');
                if (diceOption) {
                    dice = Math.min(Math.max(diceOption, 1), 1000000);
                }

                const print_rolls = [];
                let total = 0;
                for (let i = 0; i < dice; i++) {
                    const r = Math.floor(Math.random() * sides) + 1;
                    total += r;

                    if (i < 19) {
                        // only show the first 20 rolls to the user
                        print_rolls.push(r);
                    }
                }

                if (dice == 1) {
                    await interaction.reply(`You rolled ${total} on a ${sides} sided die!`);
                } else {
                    await interaction.reply(
                        `You rolled ${dice} dice with ${sides} sides! Results: ${print_rolls.join(
                            ', ',
                        )} ...\nTotal sum of all rolls: ${total}`,
                    );
                }
            },
        });
        return;
    }

    async runCommand(interaction: ChatInputCommandInteraction) {
        return;
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
                        option.setName('sides').setDescription('The number of sides').setRequired(true),
                    )
                    .addNumberOption((option) =>
                        option.setName('dice').setDescription('The number of dice').setRequired(false),
                    ),
            );
    }
}
