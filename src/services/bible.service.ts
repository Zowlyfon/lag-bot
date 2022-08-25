import ServiceInterface from '../service.interface';
import { Service } from 'typedi';
import EnvironmentService from './environment.service';
import axios from 'axios';

const URL = 'https://labs.bible.org/api';

@Service()
export default class BibleService implements ServiceInterface {
    constructor(private env: EnvironmentService) {}

    init() {}

    async getBiblePassage(passage: string) {
        const options = { passage: passage, formatting: 'plain', type: 'json' };
        const params = new URLSearchParams(options);
        return await axios.get(`${URL}?${params}`);
    }
}
