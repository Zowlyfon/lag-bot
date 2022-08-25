import CommandInterface from '../command.interface';
import WeatherService from '../services/weather.service';
import { SubCommand } from '../sub-command.type';
import { InteractionHandler } from '../interaction-handler.type';
import { Subject } from 'rxjs';
import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { Service } from 'typedi';

@Service()
export default class WeatherCommand implements CommandInterface {
    command = 'weather';
    subCommands = new Array<SubCommand>();
    interactionHandlers = new Array<InteractionHandler>();
    subCommandSubject = new Subject<ChatInputCommandInteraction>();

    constructor(private weatherService: WeatherService) {}

    async init() {
        this.subCommands.push(
            {
                command: 'coords',
                runCommand: async (interaction) => {
                    const lon = interaction.options.getNumber('lon');
                    const lat = interaction.options.getNumber('lat');

                    if (!lon || !lat) return;

                    await interaction.deferReply();

                    await this.getWeather(lat, lon, interaction);
                },
            },
            {
                command: 'city',
                runCommand: async (interaction) => {
                    const city = interaction.options.getString('city');

                    if (!city) return;
                    await interaction.deferReply();
                    try {
                        const geo = await this.weatherService.geoCoding(city);
                        console.log(geo);

                        if (!geo || !geo.data) {
                            await interaction.editReply('City not found');
                            return;
                        }
                        const foundCity = geo.data.pop();
                        if (!foundCity) {
                            await interaction.editReply('City not found');
                            return;
                        }
                        const lat = foundCity.lat;
                        const lon = foundCity.lon;

                        return await this.getWeather(lat, lon, interaction);
                    } catch (e) {
                        console.error(e);
                    }
                },
            },
        );
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
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('city')
                    .setDescription('Get the weather in a given city')
                    .addStringOption((option) =>
                        option.setName('city').setDescription('City to find the weather in').setRequired(true),
                    ),
            );
    }

    async getWeather(lat: number, lon: number, interaction: ChatInputCommandInteraction) {
        try {
            const result = await this.weatherService.getCurrentWeather(lat, lon);

            if (!result || !result.data) {
                await interaction.editReply('Could not fetch weather :(');
                return;
            }

            const weather = result.data;
            console.log(weather);

            const info = weather.weather.pop();

            const embed = new EmbedBuilder()
                .setTitle(`Weather ${weather.name}, ${weather.sys.country}`)
                .setColor(Colors.Green)
                .setDescription(info.description)
                .addFields(
                    { name: 'Temp', value: `${weather.main.temp}°C`, inline: true },
                    { name: 'Min', value: `${weather.main.temp_min}°C`, inline: true },
                    { name: 'Max', value: `${weather.main.temp_max}°C`, inline: true },
                    { name: 'Feels Like', value: `${weather.main.feels_like}°C`, inline: true },
                    { name: 'Pressure', value: `${weather.main.pressure}hPa`, inline: true },
                    { name: 'Humidity', value: `${weather.main.humidity}%`, inline: true },
                )
                .setThumbnail(`http://openweathermap.org/img/wn/${info.icon}@2x.png`);

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
        }
    }
}
