// This is an inlined version of the Slice Simulator component from
// `@slicemachine/adapter-nuxt` so that developing with the playground is
// more straightforward.
//
// People should **not** have that kind of component directly within their
// projects, but instead use the one provided by their Slice Machine adapter.
//
// See: https://github.com/prismicio/slice-machine/blob/5cd4d26b4d37715173202c27ed3bf1dd6ac669ff/packages/adapter-nuxt/src/simulator/SliceSimulator.ts
import {
	AllowedComponentProps,
	ComponentCustomProps,
	VNodeArrayChildren,
	VNodeProps,
} from "vue";

import {
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SimulatorManager,
	StateEventType,
	disableEventHandler,
	getDefaultMessage,
	getDefaultProps,
	getDefaultSlices,
	onClickHandler,
	simulatorClass,
	simulatorRootClass,
} from "../../src/kit";

export type SliceSimulatorProps = Omit<BaseSliceSimulatorProps, "state">;

const simulatorManager = new SimulatorManager();

export const SliceSimulatorImpl = /*#__PURE__*/ defineComponent({
	name: "SliceSimulator",
	props: {
		zIndex: {
			type: Number as PropType<Required<SliceSimulatorProps["zIndex"]>>,
			default: getDefaultProps().zIndex,
			required: false,
		},
		background: {
			type: String as PropType<Required<SliceSimulatorProps["background"]>>,
			default: getDefaultProps().background,
			required: false,
		},
	},
	setup(props, { slots }) {
		const slices = ref(getDefaultSlices());
		const message = ref(getDefaultMessage());

		onMounted(async () => {
			simulatorManager.state.on(
				StateEventType.Slices,
				(_slices) => {
					slices.value = _slices;
				},
				"simulator-slices",
			);
			simulatorManager.state.on(
				StateEventType.Message,
				(_message) => {
					message.value = _message;
				},
				"simulator-message",
			);

			await simulatorManager.init();
		});

		onUnmounted(() => {
			simulatorManager.state.off(StateEventType.Slices, "simulator-slices");

			simulatorManager.state.off(StateEventType.Message, "simulator-message");
		});

		return () => {
			const children: VNodeArrayChildren = [];

			if (message.value) {
				children.push(
					h("article", {
						innerHTML: message.value,
					}),
				);
			} else if (slices.value.length && slots.default) {
				children.push(
					h(
						"div",
						{
							id: "root",
							class: simulatorRootClass,
							onClickCapture: onClickHandler,
							onSubmitCapture: disableEventHandler,
						},
						[
							slots.default({
								slices: slices.value,
							}),
						],
					),
				);
			}

			return h(
				"div",
				{
					class: simulatorClass,
					style: {
						zIndex: props.zIndex,
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100vh",
						overflow: "auto",
						background: props.background,
					},
				},
				children,
			);
		};
	},
});

// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
export const SliceSimulator = SliceSimulatorImpl as unknown as {
	new (): {
		$props: AllowedComponentProps &
			ComponentCustomProps &
			VNodeProps &
			SliceSimulatorProps;
	};
};

export default SliceSimulator;
