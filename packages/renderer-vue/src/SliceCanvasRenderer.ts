import Vue, { PropType, VNodeChildren } from "vue";

import { RendererAPI, ClientRequestType } from "@prismicio/slice-canvas-com";
import {
	createStateManager,
	getDefaultState,
	SliceCanvasData,
	SliceCanvasProps,
} from "@prismicio/slice-canvas-renderer";

export const SliceCanvasRenderer = Vue.extend<
	SliceCanvasData,
	Record<string, never>,
	Record<string, never>,
	SliceCanvasProps
>({
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
	mounted() {
		this.stateManager.on("loaded", async (state) => {
			this.state = state;

			const api = new RendererAPI(
				{
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
				},
				{ debug: process.env.NODE_ENV === "development" },
			);

			await api.ready();
		});

		this.stateManager.load(this.statePredicate);
	},
	render(h) {
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
});
