import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://api.binance.com/api/v3'
});

export const service = axios;