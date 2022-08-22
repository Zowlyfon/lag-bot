import { Service } from 'typedi';
import { Subject, filter } from 'rxjs';
import {
    Client,
    IntentsBitField,
    Message,
    Interaction,
    ChatInputCommandInteraction,
    ButtonInteraction,
    SelectMenuInteraction,
    ModalSubmitInteraction,
} from 'discord.js';
import EnvironmentService from './environment.service';
import ServiceInterface from '../service.interface';
import CommandInterface from '../command.interface';
import DatabaseService from './database.service';

@Service()
export default class DiscordService implements ServiceInterface {
    private readonly messages: Subject<Message>;
    private readonly interactions: Subject<Interaction>;
    private readonly chatCommands: Subject<ChatInputCommandInteraction>;
    private readonly buttonInteraction: Subject<ButtonInteraction>;
    private readonly selectInteraction: Subject<SelectMenuInteraction>;
    private readonly modalInteraction: Subject<ModalSubmitInteraction>;

    private commands: Array<CommandInterface>;

    private readonly client: Client;

    constructor(private env: EnvironmentService, private db: DatabaseService) {
        this.messages = new Subject<Message>();
        this.interactions = new Subject<Interaction>();
        this.chatCommands = new Subject<ChatInputCommandInteraction>();
        this.buttonInteraction = new Subject<ButtonInteraction>();
        this.selectInteraction = new Subject<SelectMenuInteraction>();
        this.modalInteraction = new Subject<ModalSubmitInteraction>();
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
            this.interactions.next(interaction);
        });

        this.client.on('messageCreate', async (message: Message) => {
            this.messages.next(message);
        });

        this.interactions.subscribe((interaction: Interaction) => {
            if (interaction.isChatInputCommand()) {
                this.chatCommands.next(interaction);
            }

            if (interaction.isButton()) {
                this.buttonInteraction.next(interaction);
            }

            if (interaction.isSelectMenu()) {
                this.selectInteraction.next(interaction);
            }

            if (interaction.isModalSubmit()) {
                this.modalInteraction.next(interaction);
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

    getButtonInteractions(): Subject<ButtonInteraction> {
        return this.buttonInteraction;
    }

    getSelectInteractions(): Subject<SelectMenuInteraction> {
        return this.selectInteraction;
    }

    getModalInteractions(): Subject<ModalSubmitInteraction> {
        return this.modalInteraction;
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
