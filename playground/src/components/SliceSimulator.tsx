"use client";

// This is an inlined version of the Slice Simulator component from
// `@slicemachine/adapter-next` so that developing with the playground is
// more straightforward.
//
// People should **not** have that kind of component directly within their
// projects, but instead use the one provided by their Slice Machine adapter.
//
// See: https://github.com/prismicio/slice-machine/blob/5cd4d26b4d37715173202c27ed3bf1dd6ac669ff/packages/adapter-next/src/simulator/SliceSimulator.tsx
import * as React from "react";

import {
	SliceSimulatorProps as BaseSliceSimulatorProps,
	SimulatorManager,
	SliceSimulatorState,
	StateEventType,
	disableEventHandler,
	getDefaultMessage,
	getDefaultProps,
	getDefaultSlices,
	onClickHandler,
	simulatorClass,
	simulatorRootClass,
} from "@/../../src/kit";

const simulatorManager = new SimulatorManager();

export type SliceSimulatorSliceZoneProps = {
	slices: SliceSimulatorState["slices"];
};

export type SliceSimulatorProps = {
	/**
	 * React component to render simulated Slices.
	 *
	 * @example
	 *
	 * ```tsx
	 * import { SliceSimulator } from "@slicemachine/adapter-next/simulator";
	 * import { SliceZone } from "@prismicio/react";
	 *
	 * import { components } from "../slices";
	 *
	 * <SliceSimulator
	 * 	sliceZone={({ slices }) => (
	 * 		<SliceZone slices={slices} components={components} />
	 * 	)}
	 * />;
	 * ```
	 */
	sliceZone: (props: SliceSimulatorSliceZoneProps) => JSX.Element;
	className?: string;
} & Omit<BaseSliceSimulatorProps, "state">;

export const SliceSimulator = ({
	sliceZone: SliceZoneComp,
	background,
	zIndex,
	className,
}: SliceSimulatorProps): JSX.Element => {
	const defaultProps = getDefaultProps();

	const [slices, setSlices] = React.useState(() => getDefaultSlices());
	const [message, setMessage] = React.useState(() => getDefaultMessage());

	React.useEffect(() => {
		simulatorManager.state.on(
			StateEventType.Slices,
			(_slices) => {
				setSlices(_slices);
			},
			"simulator-slices",
		);
		simulatorManager.state.on(
			StateEventType.Message,
			(_message) => {
				setMessage(_message);
			},
			"simulator-message",
		);

		simulatorManager.init();

		return () => {
			simulatorManager.state.off(StateEventType.Slices, "simulator-slices");

			simulatorManager.state.off(StateEventType.Message, "simulator-message");
		};
	}, []);

	return (
		<div
			className={[simulatorClass, className].filter(Boolean).join(" ")}
			style={{
				zIndex:
					typeof zIndex === "undefined"
						? defaultProps.zIndex
						: zIndex ?? undefined,
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100vh",
				overflow: "auto",
				background:
					typeof background === "undefined"
						? defaultProps.background
						: background ?? undefined,
			}}
		>
			{message ? (
				<article dangerouslySetInnerHTML={{ __html: message }} />
			) : slices.length ? (
				<div
					id="root"
					className={simulatorRootClass}
					onClickCapture={onClickHandler as unknown as React.MouseEventHandler}
					onSubmitCapture={
						disableEventHandler as unknown as React.FormEventHandler
					}
				>
					<SliceZoneComp slices={slices} />
				</div>
			) : null}
		</div>
	);
};
