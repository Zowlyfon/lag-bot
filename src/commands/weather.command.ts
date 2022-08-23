import CommandInterface from '../command.interface';
import WeatherService from '../services/weather.service';
import { SubCommand } from '../sub-command.type';
import { InteractionHandler } from '../interaction-handler.type';
import { Subject } from 'rxjs';
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { Service } from 'typedi';

@Service()
export default class WeatherCommand implements CommandInterface {
    command = 'weather';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    constructor(private weatherService: WeatherService) {}

    async init() {
        this.subCommands.push({
            command: 'coords',
            runCommand: async (interaction) => {
                const lon = interaction.options.getNumber('lon');
                const lat = interaction.options.getNumber('lat');

                if (!lon || !lat) return;

                try {
                    const result = await this.weatherService.getCurrentWeather(lat, lon);

                    if (!result) {
                        await interaction.reply({ content: 'Could not fetch weather :(', ephemeral: true });
                        return;
                    }

                    const weather = result.data;

                    await interaction.reply(
                        `Temp: ${weather.main.temp}, Feels Like: ${weather.main.feels_like}, Temp Min: ${weather.main.temp_min}, Temp Max: ${weather.main.temp_max}, Pressure: ${weather.main.pressure}, Humidity: ${weather.main.humidity}`,
                    );
                } catch (e) {
                    console.error(e);
                }
            },
        });
    }

    async runCommand() {
        return;
    }

    slashCommandBuilder(): SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.command)
            .setDescription('Weather commands')
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('coords')
                    .setDescription('Get the weather at the given coordinates')
                    .addNumberOption((option) => option.setName('lat').setDescription('Latitude').setRequired(true))
                    .addNumberOption((option) => option.setName('lon').setDescription('Longitude').setRequired(true)),
            );
    }
}
