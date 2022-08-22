import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { SubCommand } from '../sub-command.type';
import { Subject } from 'rxjs';
import yahooFinance from 'yahoo-finance2';

function shittyNumFormatter(num: number): string {
    if (num >= 1000000000000) {
        return (num / 1000000000000).toFixed(2) + 'T';
    } else if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    } else {
        return num + '';
    }
}

@Service()
export default class StockCommand implements CommandInterface {
    command = 'stock';
    subCommands = new Array<SubCommand>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    async init() {
        this.subCommands.push({
            command: 'quote',
            runCommand: async (interaction) => {
                const ticker = interaction.options.getString('ticker');

                await interaction.deferReply();

                const quote = await yahooFinance.quote(ticker as string);

                if (!quote) {
                    await interaction.reply({ content: `Invalid stock ticker specified: ${ticker}`, ephemeral: true });
                    return;
                }

                const quoteType = quote['quoteType'];
                if (quoteType !== 'EQUITY' && quoteType !== 'ETF' && quoteType !== 'INDEX') {
                    await interaction.reply({
                        content: `Sorry, stock type "${quoteType}" is not supported at this time.`,
                        ephemeral: true,
                    });
                    return;
                }

                const name = (!quote['longName'] && quote['shortName']) || quote['longName'];
                const exchange = quote['fullExchangeName'];
                const price = (quote['regularMarketPrice'] as number).toFixed(2);
                const currency = quote['currency'];
                const change = parseFloat((quote['regularMarketChange'] as number).toFixed(2));
                const changeIcon = (change > 0 && '▲') || (change < 0 && '▼') || '■';
                const changeColor = (change > 0 && 'Green') || (change < 0 && 'Red') || 'Grey';
                const changePct = (quote['regularMarketChangePercent'] as number).toFixed(2);
                const priceOpen = (quote['regularMarketOpen'] as number).toFixed(2);
                const marketCap = (!quote['marketCap'] && 'N/A') || shittyNumFormatter(quote['marketCap'] as number);
                const marketDayLow = (quote['regularMarketDayLow'] as number).toFixed(2);
                const marketDayHigh = (quote['regularMarketDayHigh'] as number).toFixed(2);

                const embed = new EmbedBuilder()
                    .setTitle(`Stock Market: ${ticker}`)
                    .setURL('https://finance.yahoo.com/quote/' + ticker)
                    .setDescription(`${name}`)
                    .addFields(
                        { name: 'Price', value: `${price} ${currency}`, inline: true },
                        { name: 'Change', value: `${changeIcon} ${change} (${changePct}%)`, inline: true },
                        { name: '\u200B', value: '\u200B', inline: true },
                    )
                    .addFields(
                        { name: 'Day Open', value: `${priceOpen}`, inline: true },
                        { name: 'Day Low', value: `${marketDayLow}`, inline: true },
                        { name: 'Day High', value: `${marketDayHigh}`, inline: true },
                        { name: 'Market Cap', value: `${marketCap}` },
                    )
                    .setTimestamp()
                    .setFooter({ text: `Price retrieved from ${exchange} via Yahoo Finance.` })
                    .setColor(changeColor);

                await interaction.editReply({ embeds: [embed] });
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
            .setDescription('View stock information')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('quote')
                    .setDescription('retrieve stock information')
                    .addStringOption((option) =>
                        option
                            .setName('ticker')
                            .setDescription('The ticker code of the desired stock.')
                            .setRequired(true),
                    ),
            );
    }
}
