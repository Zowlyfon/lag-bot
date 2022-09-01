import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';
import { InteractionHandler } from '../interaction-handler.type';

@Service()
export default class TemplateCommand implements CommandInterface {
    command = 'example'; // Name of the command
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    async init() {
        this.subCommands.push({
            command: 'subcommand', // Name of the subcommand
            runCommand: async (interaction) => {
                // Do something with the "example" subcommand

                // Fetch the options/args the user has specified
                const some_option = interaction.options.getNumber('some_option');
                const some_other_option = interaction.options.getNumber('some_other_option');
                interaction.reply(`Hello world! ${some_option} ${some_other_option}`);
            },
        });
        return;
    }

    async runCommand(interaction: ChatInputCommandInteraction) {
        // Can be used when the command is executed with no subcommands.
        return;
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('This describes what the command does.')
            .addSubcommand((subcommand) =>
                // Define your subcommands here
                // Executed with /commandname subcommand opt1 opt2 optN...
                subcommand
                    .setName('subcommand')
                    .setDescription('This describes what a subcommand does.')
                    .addNumberOption((option) =>
                        option
                            .setName('some_option')
                            .setDescription('An example option taking a number.')
                            .setRequired(true),
                    )
                    .addStringOption((option) =>
                        option
                            .setName('some_other_option')
                            .setDescription('An optional example option taking a string.')
                            .setRequired(false),
                    ),
            );
    }
}
