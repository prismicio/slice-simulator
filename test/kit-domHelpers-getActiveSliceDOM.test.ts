import { it, expect, beforeEach, afterEach } from "vitest";

import {
	getSliceZoneDOM,
	getActiveSliceDOM,
	simulatorClass,
	simulatorRootClass,
} from "../src/kit";

beforeEach(() => {
	document.body.innerHTML = `<div class="${simulatorClass}">
	<div class="${simulatorRootClass}">
		<section class="foo"></section><section class="bar"></section>
	</div>
</div>`;
});

afterEach((_t) => {
	document.body.innerHTML = "";
});

it("returns null when Slice Zone is not part of raycast", () => {
	document.elementsFromPoint = (_x, _y) => {
		return [
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			document.querySelector(`.${simulatorClass}`)!,
			document.body,
			document.documentElement,
		];
	};

	const $sliceZone = getSliceZoneDOM(2);

	expect($sliceZone).toBeInstanceOf(HTMLElement);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const $activeSlice = getActiveSliceDOM($sliceZone!, { x: 0, y: 0 });

	expect($activeSlice).toBeNull();

	// @ts-expect-error cleaning up polyfill
	delete document.elementsFromPoint;
});

it("returns null when slice is not part of raycast", () => {
	document.elementsFromPoint = (_x, _y) => {
		return [
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			document.querySelector(`.${simulatorRootClass}`)!,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			document.querySelector(`.${simulatorClass}`)!,
			document.body,
			document.documentElement,
		];
	};

	const $sliceZone = getSliceZoneDOM(2);

	expect($sliceZone).toBeInstanceOf(HTMLElement);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const $activeSlice = getActiveSliceDOM($sliceZone!, { x: 0, y: 0 });

	expect($activeSlice).toBeNull();

	// @ts-expect-error cleaning up polyfill
	delete document.elementsFromPoint;
});

it("returns slice when Slice is part of raycast", () => {
	document.elementsFromPoint = (_x, _y) => {
		return [
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			document.querySelector(`.foo`)!,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			document.querySelector(`.${simulatorRootClass}`)!,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			document.querySelector(`.${simulatorClass}`)!,
			document.body,
			document.documentElement,
		];
	};

	const $sliceZone = getSliceZoneDOM(2);

	expect($sliceZone).toBeInstanceOf(HTMLElement);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const $activeSlice = getActiveSliceDOM($sliceZone!, { x: 0, y: 0 });

	expect($activeSlice).toBeInstanceOf(HTMLElement);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	expect($activeSlice!.classList.contains("foo")).toBe(true);

	// @ts-expect-error cleaning up polyfill
	delete document.elementsFromPoint;
});
