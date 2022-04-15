import axios from "axios";
import 'dotenv/config';

export default class ApiService {
    constructor() {
        axios.defaults.baseURL = process.env.server
        axios.defaults.headers.common['Authorization'] = 'Basic ' + Buffer.from(process.env.username + ':' + process.env.password).toString('base64');
    }

    get(url: string) {
        return axios.get(url);
    }

    post(url: string, data: any) {
        return axios.post(url, data);
    }

    put(url: string, data: any) {
        return axios.put(url, data);
    }

    delete(url: string) {
        return axios.delete(url);
    }
}