import VueRouter from 'vue-router';

import HomePage from "@/pages/HomePage";
import CryptosPage from "@/pages/CryptosPage";
import NewsPage from "@/pages/NewsPage";
import DetailPage from "@/pages/DetailPage";


const routes = [
    { path: '/', component: HomePage, name: 'Home' },
    { path: '/cryptos', component: CryptosPage, name: 'Cryptos' },
    { path: '/news', component: NewsPage, name: 'News' },
    { path: '/details', component: DetailPage, name: 'Details', props: true },
];

export const router = new VueRouter({
    mode: 'history',
    routes,
})