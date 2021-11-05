import { SliceZone } from "@prismicio/types";

import { StateManager } from "./StateManager";
import { StateManagerStatus } from "./types";

export const getDefaultSlices = (stateManager?: StateManager): SliceZone => {
	// TODO: Temporary solution to mimic Storybook iframe interface
	if (
		stateManager &&
		stateManager.managedState.status === StateManagerStatus.Loaded &&
		typeof window !== "undefined" &&
		window.location.hash.startsWith("#/iframe.html")
	) {
		const query = decodeURIComponent(
			window.location.hash.replace(/^#\/iframe.html\?/i, ""),
		)
			.split("&")
			.reduce<Record<string, string>>((acc, current) => {
				const [key, value] = current.split("=");

				return { ...acc, [key]: value };
			}, {});

		if ("id" in query) {
			const [sliceID, variationID] = query.id
				.replace(/^slices-/, "")
				.split("--");

			return stateManager.getSliceZoneFromSliceIDs(
				[{ sliceID, variationID }],
				true,
			);
		}
	}

	return [];
};
