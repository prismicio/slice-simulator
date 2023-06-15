import type { SliceZone } from "@prismicio/client";

import { SliceSimulatorProps } from "./types";

export const getDefaultProps = (): Required<{
	[K in keyof SliceSimulatorProps]: NonNullable<SliceSimulatorProps[K]>;
}> => ({
	zIndex: 100,
	background: "#ffffff",
});

export const getDefaultSlices = (): SliceZone => {
	return [];
};

export const getDefaultMessage = (): string => {
	return "";
};
