import * as React from "react";

import { RendererAPI, ClientRequestType } from "@prismicio/slice-canvas-com";
import {
	createStateManager,
	getDefaultManagedState,
	getDefaultProps,
	getDefaultSlices,
	SliceCanvasData,
	SliceCanvasProps,
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
		stateManager.on("loaded", async (state) => {
			setManagedState(state);
			setSlices(getDefaultSlices(stateManager));

			const api = new RendererAPI({
				[ClientRequestType.GetLibraries]: (req, res) => {
					return res.success(stateManager.getLibraries());
				},
				[ClientRequestType.SetSliceZone]: (req, res) => {
					setSlices(req.data);

					return res.success();
				},
				[ClientRequestType.SetSliceZoneFromSliceIDs]: (req, res) => {
					setSlices(stateManager.getSliceZoneFromSliceIDs(req.data));

					return res.success();
				},
			});

			try {
				await api.ready();
			} catch (error) {
				console.error(error);
			}
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
				// TODO: Temporary solution to mimic Storybook iframe interface
				<div id="root">{props.sliceZone({ slices })}</div>
			) : null}
		</div>
	);
};
