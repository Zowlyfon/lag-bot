import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import DiscordService from '../services/discord.service';
import MessageHistoryService from '../services/message-history.service';
import QuoteService from '../services/quote.service';

@Service()
export default class QuoteCommand implements CommandInterface {
    command = 'quote';

    constructor(private discordService: DiscordService,
                private messageHistoryService: MessageHistoryService,
                private quoteService: QuoteService) {
    }

    init(): void {
        this.discordService.onChatCommand(this.command).subscribe(async (interaction) => {
            const user = interaction.options.getUser('user');
            if (user && interaction.options.getSubcommand() === 'add') {
                console.log('quote add ' + user.username);

                /*
                if (interaction.user.id === user.id) {
                    await interaction.reply({content: 'You can\'t quote yourself, cheeky', ephemeral: true});
                    return;
                }
                */

                const message = this.messageHistoryService.getLastMessageByUserIdAndChannelId(
                    user.id, interaction.channelId);

                if (message !== undefined) {
                    await this.quoteService.addQuote(message, interaction.user.id);
                    await interaction.reply({content: message?.content, ephemeral: true});
                } else {
                    await interaction.reply({content: 'No recent message found', ephemeral: true});
                }
                return;
            }

            if (user && interaction.options.getSubcommand() === 'getlast') {
                console.log('quote getlast ' + user.username);
                if (!interaction.guildId)
                    return;

                const message = await this.quoteService.getLastQuote(user.id, interaction.channelId, interaction.guildId);
                if (message !== undefined) {
                    await interaction.reply(message);
                } else {
                    await interaction.reply({content: 'No quotes found', ephemeral: true});
                }
            }
        })
    }
}