import 'reflect-metadata';
import { Container } from 'typedi';
import DiscordService from './services/discord.service';
import PingCommand from './commands/ping.command';
import CommandInterface from './command.interface';
import QuoteCommand from './commands/quote.command';
import ServiceInterface from './service.interface';
import QuoteService from './services/quote.service';
import DatabaseService from './services/database.service';
import DeployCommand from './global-commands/deploy.command';
import { ChatInputCommandInteraction } from 'discord.js';
import DisableCommandCommand from './commands/disable-command.command';
import DiceCommand from './commands/dice.command';
import WolframAlphaCommand from './commands/wolfram-alpha.command';
import RadioCommand from './commands/radio.command';
import DiscordMusicService from './services/discord-music.service';
import StockCommand from './commands/stock.command';
import { filter } from 'rxjs';

const discordService = Container.get(DiscordService);

const commands = new Array<CommandInterface>();
commands.push(Container.get(PingCommand));
commands.push(Container.get(QuoteCommand));
commands.push(Container.get(DisableCommandCommand));
commands.push(Container.get(DiceCommand));
commands.push(Container.get(WolframAlphaCommand));
commands.push(Container.get(RadioCommand));
commands.push(Container.get(StockCommand));

const services = new Array<ServiceInterface>();
services.push(Container.get(QuoteService));
services.push(Container.get(DatabaseService));
services.push(Container.get(DiscordMusicService));

discordService
    .init()
    .then(() => {
        console.log('DiscordService started');

        discordService.setCommands(commands);

        commands.forEach(async (command: CommandInterface) => {
            await command.init();

            command.subCommands.forEach((subCommand) => {
                command.subCommandSubject
                    .pipe(
                        filter((interaction) => {
                            return interaction.options.getSubcommand() === subCommand.command;
                        }),
                    )
                    .subscribe(async (interaction) => {
                        console.log(`Command: ${command.command} ${subCommand.command}`);
                        await subCommand.runCommand(interaction);
                    });
            });

            discordService
                .onChatCommand(command.command)
                .subscribe(async (interaction: ChatInputCommandInteraction) => {
                    const disabled = await discordService.isCommandDisabled(command.command, interaction.guildId);
                    console.log('Command disabled', disabled);

                    if (disabled) {
                        await interaction.reply({
                            content: 'Command disabled, please run /deploy to refresh slash commands',
                            ephemeral: true,
                        });
                        console.log('Disabled command run');
                        return;
                    }

                    console.log('Running command', command.command);
                    await command.runCommand(interaction);

                    command.subCommandSubject.next(interaction);
                });
        });

        const deployCommand = Container.get(DeployCommand);

        deployCommand.init();

        services.forEach((service: ServiceInterface) => {
            service.init();
        });
    })
    .catch((e) => {
        console.error(e);
    });
