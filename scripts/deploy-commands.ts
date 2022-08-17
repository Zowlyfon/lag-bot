import { SlashCommandBuilder, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Save and recall messages')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Save a message sent by a user')
                .addUserOption(
                    option =>
                        option
                            .setName('user')
                            .setDescription('The user to quote')
                            .setRequired(true)

                )
        )
        .addSubcommand(subcommand =>
        subcommand
            .setName('getlast')
            .setDescription('Get the last quote from a user')
            .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to fetch')
                .setRequired(true)
            )
        )
].map(command => command.toJSON());

if (process.env.BOT_SECRET !== undefined &&
    process.env.GUILD_ID !== undefined &&
    process.env.CLIENT_ID !== undefined) {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_SECRET);

    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: commands})
        .then(() => console.log('Successfully registered application commands.'))
        .catch((e) => console.error(e));
} else {
    console.log('Environment variables undefined');
}
