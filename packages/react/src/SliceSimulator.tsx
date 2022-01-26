import * as React from "react";

import {
	createStateManager,
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	getDefaultMessage,
	onClickHandler,
	disableEventHandler,
	SliceSimulatorData,
	SliceSimulatorProps as _SliceSimulatorProps,
	StateManagerEventType,
	StateManagerStatus,
} from "@prismicio/slice-simulator-core";

export type SliceSimulatorProps = {
	className?: string;
	sliceZone: (args: {
		slices: SliceSimulatorData["slices"];
	}) => React.ComponentType;
} & _SliceSimulatorProps;

export const SliceSimulator = (props: SliceSimulatorProps): JSX.Element => {
	const defaultProps = getDefaultProps();

	const stateManager = createStateManager();
	const [managedState, setManagedState] = React.useState(
		getDefaultManagedState(),
	);
	const [slices, setSlices] = React.useState(getDefaultSlices());
	const [message, setMessage] = React.useState(getDefaultMessage());

	React.useEffect(() => {
		stateManager.on(StateManagerEventType.Loaded, (state) => {
			setManagedState(state);
		});
		stateManager.on(StateManagerEventType.Slices, (slices) => {
			setSlices(slices);
		});
		stateManager.on(StateManagerEventType.Message, (message) => {
			setMessage(message);
		});

		stateManager.load(props.state);
	}, []);

	return (
		<div
			className={["slice-simulator", props.className].filter(Boolean).join(" ")}
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
