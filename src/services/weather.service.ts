import ServiceInterface from '../service.interface';
import { Service } from 'typedi';
import EnvironmentService from './environment.service';
import axios from 'axios';
import { URLSearchParams } from 'url';

const URL = 'https://api.openweathermap.org/';

@Service()
export default class WeatherService implements ServiceInterface {
    private api = '';

    constructor(private env: EnvironmentService) {}

    init() {
        this.api = this.env.getOpenWeatherKey();
    }

    async getCurrentWeather(lat: number, lon: number) {
        const options = { lat: lat.toString(), lon: lon.toString(), appid: this.api, units: 'metric' };
        const params = new URLSearchParams(options);
        return await axios.get(`${URL}data/2.5/weather?${params}`);
    }

    async geoCoding(city: string) {
        const options = { q: city, limit: '1', appid: this.api };
        const params = new URLSearchParams(options);
        return await axios.get(`${URL}geo/1.0/direct?${params}`);
    }
}
