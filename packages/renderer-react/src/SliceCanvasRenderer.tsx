import * as React from "react";

import { RendererAPI, ClientRequestType } from "@prismicio/slice-canvas-com";
import {
	createStateManager,
	getDefaultState,
	SliceCanvasData,
	SliceCanvasProps,
} from "@prismicio/slice-canvas-renderer";

export type SliceCanvasRendererProps = {
	sliceZone: (slices: SliceCanvasData["slices"]) => React.ComponentType;
} & SliceCanvasProps;

export const SliceCanvasRenderer = (
	props: SliceCanvasRendererProps,
): JSX.Element => {
	const stateManager = createStateManager();
	const [state, setState] = React.useState<SliceCanvasData["state"]>(
		getDefaultState(),
	);
	const [slices, setSlices] = React.useState<SliceCanvasData["slices"]>([]);

	React.useEffect(() => {
		stateManager.on("loaded", async (state) => {
			setState(state);

			const api = new RendererAPI({
				[ClientRequestType.GetLibraries]: (req, res) => {
					return res.success(stateManager.getLibraries());
				},
				[ClientRequestType.SetSliceZone]: (req, res) => {
					setSlices(req.data);

					return res.success();
				},
				[ClientRequestType.SetSliceZoneFromSliceIDs]: (req, res) => {
					setSlices(stateManager.setSliceZoneFromSliceIDs(req.data));

					return res.success();
				},
			});

			await api.ready();
		});

		stateManager.load(props.statePredicate);
	}, []);

	return (
		<div
			className="slice-canvas-renderer"
			style={{
				zIndex: props.zIndex,
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100vh",
				overflow: "auto",
				background: "#fefefe",
			}}
		>
			{state.data && slices.length ? props.sliceZone(slices) : null}
		</div>
	);
};

// TODO: Defaults should come from the agnostic renderer package
// Not sure if this is the right way to handle default props properly
// though as when using the component TS doesn't whine about missing props
SliceCanvasRenderer.defaultProps = {
	zIndex: 100,
};
