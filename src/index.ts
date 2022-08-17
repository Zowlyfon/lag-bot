import 'reflect-metadata';
import { Container } from 'typedi';
import DiscordService from './services/discord.service';
import PingCommand from './commands/ping.command';
import CommandInterface from './command.interface';

const discordService = Container.get(DiscordService);

const commands = new Array<CommandInterface>()
commands.push(Container.get(PingCommand))
discordService.init().then(() => {
    console.log('DiscordService started');
    commands.forEach((command: CommandInterface) => {
        command.init();
    })
}).catch((e) => {
    console.error(e);
});
