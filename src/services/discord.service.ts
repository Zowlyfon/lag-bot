import { Service } from 'typedi';
import {Subject, filter, map, Observable} from 'rxjs';
import {Client, IntentsBitField, Message, Interaction, ChatInputCommandInteraction} from 'discord.js';
import EnvironmentService from './environment.service';
import ServiceInterface from '../service.interface';

@Service()
export default class DiscordService implements ServiceInterface{
    private readonly messages: Subject<Message>;
    private readonly interactions: Subject<Interaction>;
    private readonly chatCommands: Subject<ChatInputCommandInteraction>;

    constructor(private env: EnvironmentService) {
        this.messages = new Subject<Message>();
        this.interactions = new Subject<Interaction>();
        this.chatCommands = new Subject<ChatInputCommandInteraction>();
    }

    async init() {
        const intents = new IntentsBitField();
        intents.add(IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent);
        const client = new Client({intents});

        client.once('ready', () => {
            console.log('Ready!');
        })

        client.login(this.env.getBotSecret()).then(() => {
            console.log('Client logged in');
        }).catch((e) => {
            console.error('Error logging in', e);
        });

        client.on('interactionCreate', async (interaction: Interaction) => {
            console.log('interaction', interaction);
            this.interactions.next(interaction);
        });

        client.on('messageCreate', async (message: Message) => {
            console.log('message', message);
            this.messages.next(message);
        });

        this.interactions.subscribe((interaction: Interaction) => {
            if (interaction.isChatInputCommand()) {
                this.chatCommands.next(interaction);
            }
        });
    }

    getMessages(): Subject<Message> {
        return this.messages;
    }

    getInteractions(): Subject<Interaction> {
        return this.interactions;
    }

    getChatCommands(): Subject<ChatInputCommandInteraction> {
        return this.chatCommands;
    }

    onChatCommand(command: string) {
        return this.chatCommands.pipe(filter((interaction: ChatInputCommandInteraction) => {
            return interaction.commandName === command;
        }));
    }

}