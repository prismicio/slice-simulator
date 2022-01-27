import * as React from "react";

import {
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	getDefaultMessage,
	onClickHandler,
	disableEventHandler,
	simulatorClass,
	SliceSimulatorProps as _SliceSimulatorProps,
	SliceSimulatorState,
	StateManagerEventType,
	StateManagerStatus,
	CoreManager,
} from "@prismicio/slice-simulator-core";

export type SliceSimulatorProps = {
	className?: string;
	sliceZone: (args: {
		slices: SliceSimulatorState["slices"];
	}) => React.ComponentType;
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
		);
		coreManager.stateManager.on(StateManagerEventType.Slices, (_slices) => {
			setSlices(_slices);
		});
		coreManager.stateManager.on(StateManagerEventType.Message, (_message) => {
			setMessage(_message);
		});

		coreManager.init(props.state);
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
