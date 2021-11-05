import Vue, { PropType, VNodeChildren } from "vue";
import { CreateElement, ExtendedVue } from "vue/types/vue";

import { RendererAPI, ClientRequestType } from "@prismicio/slice-canvas-com";
import {
	createStateManager,
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	SliceCanvasData,
	SliceCanvasOptions,
	SliceCanvasProps,
} from "@prismicio/slice-canvas-renderer";

export const SliceCanvasRenderer = {
	name: "SliceCanvasRenderer",
	props: {
		state: {
			type: [Function, Array] as PropType<SliceCanvasProps["state"]>,
			required: true,
		},
		zIndex: {
			type: Number as PropType<Required<SliceCanvasProps["zIndex"]>>,
			default: getDefaultProps().zIndex,
			required: false,
		},
	},
	data() {
		return {
			stateManager: createStateManager(),
			managedState: getDefaultManagedState(),
			slices: getDefaultSlices(),
		};
	},
	mounted(this: SliceCanvasOptions) {
		this.stateManager.on("loaded", async (state) => {
			this.managedState = state;
			this.slices = getDefaultSlices(this.stateManager);

			const api = new RendererAPI({
				[ClientRequestType.GetLibraries]: (_req, res) => {
					return res.success(this.stateManager.getLibraries());
				},
				[ClientRequestType.SetSliceZone]: (req, res) => {
					this.slices = req.data;

					return res.success();
				},
				[ClientRequestType.SetSliceZoneFromSliceIDs]: (req, res) => {
					this.slices = this.stateManager.getSliceZoneFromSliceIDs(req.data);

					return res.success();
				},
			});

			try {
				await api.ready();
			} catch (error) {
				console.error(error);
			}
		});

		this.stateManager.load(this.state);
	},
	render(this: SliceCanvasOptions & Vue, h: CreateElement) {
		const children: VNodeChildren = [];

		if (
			this.managedState.data &&
			this.slices.length &&
			this.$scopedSlots.default
		) {
			// TODO: Temporary solution to mimic Storybook iframe interface
			children.push(
				h("div", { attrs: { id: "root" } }, [
					this.$scopedSlots.default({
						slices: this.slices,
					}),
				]),
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
