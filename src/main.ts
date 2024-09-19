import './style.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Particles from '@tsparticles/vue3';
import { loadFull as ld } from 'tsparticles';
import store from "./store";

const app = createApp(App).use(Particles, {
	init: async engine => {
		ld(engine);
	},
});
app.use(router);
app.use(store);
app.mount('#app');
