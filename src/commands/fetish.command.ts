import CommandInterface from '../command.interface';
import { Service } from 'typedi';
import { SubCommand } from '../sub-command.type';
import { InteractionHandler } from '../interaction-handler.type';
import { Subject } from 'rxjs';
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

@Service()
export default class FetishCommand implements CommandInterface {
    command = 'fetish';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    fetishImages = [
        'https://i.imgur.com/FFy1IEg.jpg',
        'https://i.imgur.com/RspJyHy.gif',
        'https://i.imgur.com/J6EB8vs.gif',
        'https://imgur.com/LoYBEhZ',
        'https://i.imgur.com/bn2pnT6.gif',
        'https://i.imgur.com/MfZydOB.gif',
        'https://i.imgur.com/8N3DmQ6.gif',
        'https://imgur.com/veDLZc6',
        'https://i.imgur.com/jRTllgX.gif',
        'https://i.imgur.com/r9187c5.gif',
        'https://i.imgur.com/HUW0L1q.jpg',
        'https://i.imgur.com/rDhDhIU.gif',
        'https://i.imgur.com/QYypuG1.gif',
        'https://i.imgur.com/SE0Wzjx.gif',
        'https://i.imgur.com/SUNo8wV.gif',
        'https://i.imgur.com/xcruehZ.gif',
        'https://i.imgur.com/dTtAQyI.gif',
        'https://i.imgur.com/DIK7Tpb.gif',
        'https://i.imgur.com/uDlBc7X.gif',
        'https://i.imgur.com/dIy5gdd.gif',
        'https://i.imgur.com/9TGDK39.jpg',
        'https://i.imgur.com/fSiBZOj.gif',
        'https://i.imgur.com/f5JMDGK.jpg',
        'https://i.imgur.com/Wy2URSw.gif',
        'https://i.imgur.com/CVfuIwe.jpg',
        'https://i.imgur.com/3xKiDnC.gif',
        'https://i.imgur.com/WDszWfj.gif',
        'https://i.imgur.com/1DRvg1V.gif',
        'https://i.imgur.com/WK723Wk.jpg',
        'https://i.imgur.com/DJiaI7L.png',
    ];

    async init() {
        return;
    }

    async runCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const fetish = this.fetishImages[Math.floor(Math.random() * this.fetishImages.length)];
        const embed = new EmbedBuilder().setTitle("That's my Fetish!").setImage(fetish).setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder().setName(this.command).setDescription("Alert people that it's your fetish!");
    }
}
