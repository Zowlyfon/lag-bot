import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.once('ready', () => {
    console.log('Ready!');
})

client.login(process.env.BOT_SECRET).then(() => {
    console.log('Client logged in');
}).catch((e) => {
    console.error('Error logging in', e);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});