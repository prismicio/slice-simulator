import Vue, { PropType, VNodeChildren } from "vue";

import { RendererAPI, ClientRequestType } from "@prismicio/slice-canvas-com";
import {
	createStateManager,
	getDefaultState,
	SliceCanvasData,
	SliceCanvasOptions,
	SliceCanvasProps,
} from "@prismicio/slice-canvas-renderer";
import { CreateElement, ExtendedVue } from "vue/types/vue";

export const SliceCanvasRenderer = {
	name: "SliceCanvasRenderer",
	props: {
		statePredicate: {
			type: Function as PropType<SliceCanvasProps["statePredicate"]>,
			// @ts-expect-error - Only valid in real context
			default: () => import("~~/.slicemachine/slice-canvas-state.json"),
		},
		zIndex: {
			type: Number as PropType<SliceCanvasProps["zIndex"]>,
			default: 100,
		},
	},
	data() {
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
				[ClientRequestType.GetLibraries]: (req, res) => {
					return res.success(this.stateManager.getLibraries());
				},
				[ClientRequestType.SetSliceZone]: (req, res) => {
					this.slices = req.data;

					return res.success();
				},
				[ClientRequestType.SetSliceZoneFromSliceIDs]: (req, res) => {
					this.slices = this.stateManager.setSliceZoneFromSliceIDs(req.data);

					return res.success();
				},
			});

			await api.ready();
		});

		this.stateManager.load(this.statePredicate);
	},
	render(this: SliceCanvasOptions & Vue, h: CreateElement) {
		const children: VNodeChildren = [];

		if (this.state && this.slices.length && this.$scopedSlots.default) {
			children.push(
				this.$scopedSlots.default({
					slices: this.slices,
				}),
			);
		}

		return h(
			"div",
			{
				class: "slice-canvas-renderer",
				style: {
					zIndex: this.zIndex,
					position: "fixed",
					top: 0,
					left: 0,
					width: "100%",
					height: "100vh",
					overflow: "auto",
					background: "#fefefe",
				},
			},
			children,
		);
	},
	// This is some weird ass trick to get around `Vue.extend` messing up `this` context, don't do this at home kids
} as unknown as ExtendedVue<
	Vue,
	SliceCanvasData,
	Record<string, never>,
	Record<string, never>,
	SliceCanvasProps
>;
