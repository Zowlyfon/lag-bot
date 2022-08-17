import { Service } from 'typedi';
import { BehaviorSubject } from 'rxjs';
import { Client, IntentsBitField, Message, Interaction } from 'discord.js';
import EnvironmentService from './environment.service';

@Service()
export default class DiscordService {
    private messages: BehaviorSubject<Message | undefined>;
    private interactions: BehaviorSubject<Interaction | undefined>;

    constructor(private env: EnvironmentService) {
        this.messages = new BehaviorSubject<Message | undefined>(undefined);
        this.interactions = new BehaviorSubject<Interaction | undefined>(undefined);
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
        })
    }

    getMessages() {
        return this.messages;
    }

    getInteractions() {
        return this.interactions;
    }

}