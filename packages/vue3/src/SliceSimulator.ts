import {
	defineComponent,
	ref,
	onMounted,
	h,
	PropType,
	VNodeArrayChildren,
	AllowedComponentProps,
	ComponentCustomProps,
	VNodeProps,
} from "vue";

import {
	createStateManager,
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	getDefaultMessage,
	onClickHandler,
	disableEventHandler,
	SliceSimulatorProps as _SliceSimulatorProps,
	StateManagerEventType,
} from "@prismicio/slice-simulator-core";

export type SliceSimulatorProps = _SliceSimulatorProps;

export const SliceSimulatorImpl = /*#__PURE__*/ defineComponent({
	name: "SliceSimulator",
	props: {
		state: {
			type: [Function, Object] as PropType<SliceSimulatorProps["state"]>,
			required: true,
		},
		zIndex: {
			type: Number as PropType<Required<SliceSimulatorProps["zIndex"]>>,
			default: getDefaultProps().zIndex,
			required: false,
		},
	},
	setup(props, { slots }) {
		const stateManager = createStateManager();
		const managedState = ref(getDefaultManagedState());
		const slices = ref(getDefaultSlices());
		const message = ref(getDefaultMessage());

		onMounted(() => {
			stateManager.on(StateManagerEventType.Loaded, (state) => {
				managedState.value = state;
			});
			stateManager.on(StateManagerEventType.Slices, (_slices) => {
				slices.value = _slices;
			});
			stateManager.on(StateManagerEventType.Message, (_message) => {
				message.value = _message;
			});

			stateManager.load(props.state);
		});

		return () => {
			const children: VNodeArrayChildren = [];

			if (message.value) {
				children.push(
					h("article", {
						innerHTML: message.value,
					}),
				);
			} else if (
				managedState.value.data &&
				slices.value.length &&
				slots.default
			) {
				children.push(
					h(
						"div",
						{
							id: "root",
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
					class: "slice-simulator",
					style: {
						zIndex: props.zIndex,
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
