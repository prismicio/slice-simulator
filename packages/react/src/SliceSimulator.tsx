import * as React from "react";

import {
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	getDefaultMessage,
	onClickHandler,
	disableEventHandler,
	simulatorClass,
	simulatorRootClass,
	SliceSimulatorProps as _SliceSimulatorProps,
	SliceSimulatorState,
	StateManagerEventType,
	StateManagerStatus,
	CoreManager,
} from "@prismicio/slice-simulator-core";

export type SliceSimulatorProps = {
	className?: string;
	sliceZone: (props: { slices: SliceSimulatorState["slices"] }) => JSX.Element;
} & _SliceSimulatorProps;

const coreManager = new CoreManager();

export const SliceSimulator = (props: SliceSimulatorProps): JSX.Element => {
	const defaultProps = getDefaultProps();

	const [managedState, setManagedState] = React.useState(
		getDefaultManagedState(),
	);
	const [slices, setSlices] = React.useState(getDefaultSlices());
	const [message, setMessage] = React.useState(getDefaultMessage());

	React.useEffect(() => {
		coreManager.stateManager.on(
			StateManagerEventType.ManagedState,
			(_managedState) => {
				setManagedState(_managedState);
			},
			"simulator-managed-state",
		);
		coreManager.stateManager.on(
			StateManagerEventType.Slices,
			(_slices) => {
				setSlices(_slices);
			},
			"simulator-slices",
		);
		coreManager.stateManager.on(
			StateManagerEventType.Message,
			(_message) => {
				setMessage(_message);
			},
			"simulator-message",
		);

		coreManager.init(props.state);

		return () => {
			coreManager.stateManager.off(
				StateManagerEventType.ManagedState,
				"simulator-managed-state",
			);

			coreManager.stateManager.off(
				StateManagerEventType.Slices,
				"simulator-slices",
			);

			coreManager.stateManager.off(
				StateManagerEventType.Message,
				"simulator-message",
			);
		};
	}, []);

	// Update state on HMR
	const didMount = React.useRef(false);
	React.useEffect(() => {
		if (didMount.current) {
			coreManager.stateManager.reload(props.state);
		} else {
			didMount.current = true;
		}
	}, [props.state]);

	return (
		<div
			className={[simulatorClass, props.className].filter(Boolean).join(" ")}
			style={{
				zIndex:
					typeof props.zIndex === "undefined"
						? defaultProps.zIndex
						: props.zIndex ?? undefined,
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100vh",
				overflow: "auto",
				background:
					typeof props.background === "undefined"
						? defaultProps.background
						: props.background ?? undefined,
			}}
		>
			{message ? (
				<article dangerouslySetInnerHTML={{ __html: message }} />
			) : slices.length ? (
				<div
					id="root"
					className={simulatorRootClass}
					style={
						managedState.status !== StateManagerStatus.Loaded
							? { display: "none" }
							: undefined
					}
					onClickCapture={onClickHandler as unknown as React.MouseEventHandler}
					onSubmitCapture={
						disableEventHandler as unknown as React.FormEventHandler
					}
				>
					{props.sliceZone({ slices })}
				</div>
			) : null}
		</div>
	);
};
