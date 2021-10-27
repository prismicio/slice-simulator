import { Ref, ref, toRaw, unref } from "vue";

import {
	LibrarySummary,
	SliceSummary,
	VariationSummary,
} from "@prismicio/slice-canvas-renderer";

export const state = ref<{
	libraries: LibrarySummary[] | null;
	current: {
		slice: SliceSummary;
		variation: VariationSummary;
	} | null;
}>({
	libraries: null,
	current: null,
});

export const setLibraries = (libraries: LibrarySummary[]): void => {
	state.value.libraries = libraries;
};

export const setCurrent = (
	slice: SliceSummary | Ref<SliceSummary>,
	variation: VariationSummary | Ref<VariationSummary>,
): void => {
	state.value.current = {
		slice: unref(toRaw(slice)),
		variation: unref(toRaw(variation)),
	};
};
