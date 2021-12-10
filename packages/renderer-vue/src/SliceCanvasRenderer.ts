import Vue, { PropType, VNodeChildren } from "vue";
import { CreateElement, ExtendedVue } from "vue/types/vue";

import {
	createStateManager,
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	getDefaultMessage,
	onClickHandler,
	disableEventHandler,
	SliceCanvasData,
	SliceCanvasOptions,
	SliceCanvasProps,
	StateManagerEventType,
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
			message: getDefaultMessage(),
		};
	},
	mounted(this: SliceCanvasOptions) {
		this.stateManager.on(StateManagerEventType.Loaded, (state) => {
			this.managedState = state;
		});
		this.stateManager.on(StateManagerEventType.Slices, (slices) => {
			this.slices = slices;
		});
		this.stateManager.on(StateManagerEventType.Message, (message) => {
			this.message = message;
		});

		this.stateManager.load(this.state);
	},
	render(this: SliceCanvasOptions & Vue, h: CreateElement) {
		const children: VNodeChildren = [];

		if (this.message) {
			children.push(
				h("article", {
					domProps: {
						innerHTML: this.message,
					},
				}),
			);
		} else if (
			this.managedState.data &&
			this.slices.length &&
			this.$scopedSlots.default
		) {
			children.push(
				h(
					"div",
					{
						attrs: { id: "root" },
						on: {
							"!click": onClickHandler,
							"!submit": disableEventHandler,
						},
					},
					[
						this.$scopedSlots.default({
							slices: this.slices,
						}),
					],
				),
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
