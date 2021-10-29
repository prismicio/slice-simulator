<template>
	<div class="slice-canvas-renderer" :style="{
		zIndex,
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100vh',
		overflow: 'auto',
		background: '#fefefe'
	}">
		<slot :slices="slices" v-if="state" />
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { ExtendedVue } from "vue/types/vue";

import { RendererAPI, ClientRequestType } from "@prismicio/slice-canvas-com";
import {
	createStateManager,
	getDefaultState,
	SliceCanvasData,
	SliceCanvasProps,
	SliceCanvasOptions,
} from "@prismicio/slice-canvas-renderer";

export default {
	name: "SliceCanvasRenderer",
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
			slices: [],
		};
	},
	mounted(this: SliceCanvasOptions) {
		this.stateManager.on("loaded", async (state) => {
			this.state = state;

			const api = new RendererAPI({
				[ClientRequestType.GetLibraries]: () => this.stateManager.getLibraries(),
				[ClientRequestType.SetSliceZone]: (message) => {
					this.slices = message.data;
				},
				[ClientRequestType.SetSliceZoneFromSliceIDs]: (message) => {
					this.slices = this.stateManager.setSliceZoneFromSliceIDs(message.data);
				}
			}, { debug: process.env.NODE_ENV === "development" });

			await api.ready();
		});

		this.stateManager.load(this.statePredicate);
	}
	// This is some weird ass trick to get around `Vue.extend` messing up `this` context, don't do this at home kids
} as unknown as ExtendedVue<Vue, SliceCanvasData, {}, {}, SliceCanvasProps>;
</script>
