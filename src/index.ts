import 'reflect-metadata';
import { Container } from 'typedi';
import DiscordService from './services/discord.service';
import PingCommand from './commands/ping.command';
import CommandInterface from './command.interface';
import QuoteCommand from './commands/quote.command';
import MessageHistoryService from './services/message-history.service';
import ServiceInterface from './service.interface';
import QuoteService from './services/quote.service';

const discordService = Container.get(DiscordService);

const commands = new Array<CommandInterface>();
commands.push(Container.get(PingCommand));
commands.push(Container.get(QuoteCommand));

const services = new Array<ServiceInterface>();
services.push(Container.get(MessageHistoryService));
services.push(Container.get(QuoteService));

discordService.init().then(() => {
    console.log('DiscordService started');
    commands.forEach((command: CommandInterface) => {
        command.init();
    });

    services.forEach((service: ServiceInterface) => {
        service.init();
    })
}).catch((e) => {
    console.error(e);
});
