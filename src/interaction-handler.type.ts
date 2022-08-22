import { InteractionType } from './interaction-type.enum';
import { Interaction } from 'discord.js';

export type InteractionHandler = {
    handler: string;
    type: InteractionType;
    runHandler: (interaction: Interaction) => Promise<void>;
};
