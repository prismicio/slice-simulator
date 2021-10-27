import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-400-italic.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-500-italic.css";
import "~/assets/css/style.css";

import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./plugins/router";

createApp(App).use(router).mount("#app");
