import DiscordService from './discord.service';
import {Service} from 'typedi';
import {Message} from 'discord.js';
import ServiceInterface from '../service.interface';

@Service()
export default class MessageHistoryService implements ServiceInterface{
    private messageHistory: Array<Message>;
    constructor (private discordService: DiscordService) {
        this.messageHistory = new Array<Message>();
    }

    init(): void {
        this.discordService.getMessages().subscribe(async (message: Message | undefined) => {
            if (message !== undefined) {
                this.addMessage(message);
            }
        })
    }

    addMessage(message: Message): void {
        console.log('Pushing message to history')
        this.messageHistory.push(message);
        if (this.messageHistory.length > 100) {
            this.messageHistory.pop();
        }
    }

    getLastMessageByUserIdAndChannelId(userId: string, channelId: string): Message | undefined {
        return this.messageHistory.reverse().find((message: Message) =>
            message.author.id === userId && message.channelId === channelId);
    }
}