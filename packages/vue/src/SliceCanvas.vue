<template>
	<div class="slice-canvas">
		<SliceCanvasHub />
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import {
	createStateManager,
	getDefaultState,
	createRouter,
	getDefaultRoute,
	SliceCanvasData
} from "@prismicio/slice-canvas-client";
import "@prismicio/slice-canvas-client/dist/css/style.min.css";

import SliceCanvasHub from "./SliceCanvasHub.vue";

export default Vue.extend({
	components: {
		SliceCanvasHub
	},
	props: {
		statePredicate: {
			type: Function as PropType<() => Promise<unknown>>,
			default: () => import("~~/.slicemachine/slice-canvas-state.json"),
		},
	},
	data(): SliceCanvasData {
		return {
			stateManager: createStateManager(),
			state: getDefaultState(),
			router: createRouter(),
			route: getDefaultRoute(),
		};
	},
	mounted() {
		this.stateManager.on("loaded", (state) => {
			console.log(state);
			this.state = state;

			this.router.watch();
		});
		this.router.on("routeResolved", (route) => {
			console.log(route);
			this.route = route;
		})

		this.stateManager.load(this.statePredicate);
	}
})
</script>
