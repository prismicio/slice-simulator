import * as React from "react";

import {
	createStateManager,
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	onClickHandler,
	disableEventHandler,
	SliceCanvasData,
	SliceCanvasProps,
	StateManagerEventType,
} from "@prismicio/slice-canvas-renderer";

export type SliceCanvasRendererProps = {
	sliceZone: (args: {
		slices: SliceCanvasData["slices"];
	}) => React.ComponentType;
} & SliceCanvasProps;

export const SliceCanvasRenderer = (
	props: SliceCanvasRendererProps,
): JSX.Element => {
	const defaultProps = getDefaultProps();

	const stateManager = createStateManager();
	const [managedState, setManagedState] = React.useState(
		getDefaultManagedState(),
	);
	const [slices, setSlices] = React.useState(getDefaultSlices());

	React.useEffect(() => {
		stateManager.on(StateManagerEventType.Loaded, (state) => {
			setManagedState(state);
		});
		stateManager.on(StateManagerEventType.Slices, (slices) => {
			setSlices(slices);
		});

		stateManager.load(props.state);
	}, []);

	return (
		<div
			className="slice-canvas-renderer"
			style={{
				zIndex: props.zIndex || defaultProps.zIndex,
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100vh",
				overflow: "auto",
				background: "#fefefe",
			}}
		>
			{managedState.data && slices.length ? (
				<div
					id="root"
					onClick={onClickHandler as unknown as React.MouseEventHandler}
					onSubmit={disableEventHandler as unknown as React.FormEventHandler}
				>
					{props.sliceZone({ slices })}
				</div>
			) : null}
		</div>
	);
};
