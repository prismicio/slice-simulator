import Vue, { PropType, VNodeChildren } from "vue";
import { CreateElement, ExtendedVue } from "vue/types/vue";

import {
	createStateManager,
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	StateManagerEventType,
	SliceCanvasProps,
	SliceCanvasData,
	SliceCanvasOptions,
	SliceCanvasCSSClass,
} from "@prismicio/slice-canvas-renderer";

export const SliceCanvasRenderer = {
	name: "SliceCanvasRenderer",
	props: {
		state: {
			type: [Function, Object] as PropType<SliceCanvasProps["state"]>,
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
		this.stateManager.on(StateManagerEventType.Loaded, (state) => {
			this.managedState = state;
		});
		this.stateManager.on(StateManagerEventType.Slices, (slices) => {
			this.slices = slices;
		});

		this.stateManager.load(this.state);
	},
	render(this: SliceCanvasOptions & Vue, h: CreateElement) {
		const children: VNodeChildren = [
			h("style", {
				domProps: { innerHTML: "html { overflow: hidden; }" },
			}),
		];

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
				class: SliceCanvasCSSClass,
				style: {
					zIndex: this.zIndex,
					position: "fixed",
					top: 0,
					left: 0,
					width: "100%",
					height: "100vh",
					overflow: "auto",
					background: "#ffffff",
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
