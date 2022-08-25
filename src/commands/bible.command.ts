import CommandInterface from '../command.interface';
import BibleService from '../services/bible.service';
import { SubCommand } from '../sub-command.type';
import { InteractionHandler } from '../interaction-handler.type';
import { Subject } from 'rxjs';
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { Service } from 'typedi';

@Service()
export default class BibleCommand implements CommandInterface {
    command = 'bible';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    constructor(private bibleService: BibleService) {}

    async init() {
        this.subCommands.push({
            command: 'get',
            runCommand: async (interaction) => {
                let query = interaction.options.getString('passage');

                if (!query) {
                    query = 'votd'; // Grab the "verse of the day" if the user doesn't specify a passage.
                }

                try {
                    let result;

                    try {
                        result = await this.bibleService.getBiblePassage(query);
                    } catch (err) {
                        await interaction.reply({
                            content:
                                'Could not fetch Bible passages. Queries must be in the format "<book> <chapter>:verse[-verse][;...]"\nExample: /bible get Genesis 1:1-10;John 3:16',
                            ephemeral: true,
                        });
                        return;
                    }

                    const passagesJson = result.data;
                    const passagesFormatted = [];

                    // Get all unique booknames in case the user specifies multiple books
                    const bookNames = [...new Set(passagesJson.map((x: { bookname: string }) => x.bookname))];
                    for (const book of bookNames) {
                        // Filter for all of the passages with the current bookname (e.g get all passages from John)
                        const bookPassages = passagesJson.filter((x: { bookname: string }) => {
                            return x.bookname == book;
                        });
                        // Join them together and put them into the main passages array
                        passagesFormatted.push(
                            book +
                                ' ' +
                                bookPassages
                                    .map(
                                        (x: { chapter: string; verse: string; text: string }) =>
                                            `${x.chapter}:${x.verse} ${x.text}`,
                                    )
                                    .join(' '),
                        );
                    }

                    await interaction.reply(passagesFormatted.join('\n'));
                } catch (e) {
                    console.error(e);
                }
            },
        });
    }

    async runCommand() {
        return;
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Fetch a passage from the Bible')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('get')
                    .setDescription('Bible passage to retrieve.')
                    .addStringOption((option) =>
                        option.setName('passage').setDescription('Passage').setRequired(false),
                    ),
            );
    }
}
