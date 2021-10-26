<template>
	<div class="slice-canvas slice-canvas-pinned" :style="{ zIndex }">
		<template v-if="route">
			<SliceCanvasHub v-if="route.name === 'hub'" />
			<SliceCanvasPreview v-else-if="route.name === 'preview'" />
			<slot :slices="slices" v-if="['preview', 'playground'].includes(route.name)" />
		</template>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import {
	createStateManager,
	getDefaultState,
	createRouter,
	getDefaultRoute,
	SliceCanvasData,
	SliceCanvasProps,
	SliceCanvasOptions,
} from "@prismicio/slice-canvas-client";
import "@prismicio/slice-canvas-client/dist/css/style.min.css";

import SliceCanvasHub from "./SliceCanvasHub.vue";
import SliceCanvasPreview from "./SliceCanvasPreview.vue";
import { ExtendedVue } from "vue/types/vue";

export default {
	name: "SliceCanvas",
	components: {
		SliceCanvasHub,
		SliceCanvasPreview,
	},
	props: {
		statePredicate: {
			type: Function as PropType<() => Promise<unknown>>,
			// @ts-expect-error - Only valid in real context
			default: () => import("~~/.slicemachine/slice-canvas-state.json"),
		},
		zIndex: {
			type: Number,
			default: 100,
		}
	},
	data(): SliceCanvasData {
		return {
			stateManager: createStateManager(),
			state: getDefaultState(),
			router: createRouter(),
			route: getDefaultRoute(),
			slices: [],
		};
	},
	mounted(this: SliceCanvasOptions) {
		this.stateManager.on("loaded", (state) => {
			console.log(state);
			this.state = state;

			this.router.watch();
		});
		this.router.on("routeResolved", (route) => {
			console.log(JSON.stringify(route));
			this.route = route;
		});

		this.stateManager.load(this.statePredicate);
	}
	// This is some weird ass trick to get around `Vue.extend` messing up `this` context, don't do this at home kids
} as unknown as ExtendedVue<Vue, SliceCanvasData, {}, {}, SliceCanvasProps>;
</script>
