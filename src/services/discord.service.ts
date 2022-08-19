import { Service } from 'typedi';
import { Subject, filter } from 'rxjs';
import { Client, IntentsBitField, Message, Interaction, ChatInputCommandInteraction } from 'discord.js';
import EnvironmentService from './environment.service';
import ServiceInterface from '../service.interface';
import CommandInterface from '../command.interface';
import DatabaseService from './database.service';

@Service()
export default class DiscordService implements ServiceInterface {
    private readonly messages: Subject<Message>;
    private readonly interactions: Subject<Interaction>;
    private readonly chatCommands: Subject<ChatInputCommandInteraction>;

    private commands: Array<CommandInterface>;

    private client: Client;

    constructor(private env: EnvironmentService, private db: DatabaseService) {
        this.messages = new Subject<Message>();
        this.interactions = new Subject<Interaction>();
        this.chatCommands = new Subject<ChatInputCommandInteraction>();
        this.commands = new Array<CommandInterface>();

        const intents = new IntentsBitField();
        intents.add(
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.GuildVoiceStates,
        );
        this.client = new Client({ intents });
    }

    async init() {
        this.client.once('ready', () => {
            console.log('Ready!');
        });

        this.client
            .login(this.env.getBotSecret())
            .then(() => {
                console.log('Client logged in');
            })
            .catch((e) => {
                console.error('Error logging in', e);
            });

        this.client.on('interactionCreate', async (interaction: Interaction) => {
            console.log('interaction', interaction);
            this.interactions.next(interaction);
        });

        this.client.on('messageCreate', async (message: Message) => {
            console.log('message', message);
            this.messages.next(message);
        });

        this.interactions.subscribe((interaction: Interaction) => {
            if (interaction.isChatInputCommand()) {
                this.chatCommands.next(interaction);
            }
        });
    }

    getClient(): Client {
        return this.client;
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
        return this.chatCommands.pipe(
            filter((interaction: ChatInputCommandInteraction) => {
                return interaction.commandName === command;
            }),
        );
    }

    async getUserById(userId: string) {
        if (this.client === undefined) return;

        const user = await this.client.users.fetch(userId);
        if (user !== undefined) {
            return user;
        }
        return;
    }

    setCommands(commands: Array<CommandInterface>): void {
        this.commands = commands;
    }

    getCommands(): Array<CommandInterface> {
        return this.commands;
    }

    async isCommandDisabled(command: string, guildId?: string | null): Promise<boolean> {
        if (!guildId) return false;

        const disabledCommand = await this.db.getDisabledCommand(guildId, command);

        return !!(disabledCommand || disabledCommand === undefined);
    }
}
