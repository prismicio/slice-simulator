import { it, expect } from "vitest";

import {
	getSliceZoneDOM,
	getActiveSliceDOM,
	simulatorClass,
	simulatorRootClass,
} from "../src";

test.before((_t) => {
	document.body.innerHTML = `<div class="${simulatorClass}">
	<div class="${simulatorRootClass}">
		<section class="foo"></section><section class="bar"></section>
	</div>
</div>`;
});

test.after((_t) => {
	document.body.innerHTML = "";
});

it("returns null when Slice Zone is not part of raycast", (t) => {
	document.elementsFromPoint = (_x, _y) => {
		return [
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			document.querySelector(`.${simulatorClass}`)!,
			document.body,
			document.documentElement,
		];
	};

	const $sliceZone = getSliceZoneDOM(2);

	if ($sliceZone) {
		const $activeSlice = getActiveSliceDOM($sliceZone, { x: 0, y: 0 });

		t.is($activeSlice, null);
	} else {
		t.fail();
	}

	// @ts-expect-error cleaning up polyfill
	delete document.elementsFromPoint;
});

it("returns null when slice is not part of raycast", (t) => {
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

	if ($sliceZone) {
		const $activeSlice = getActiveSliceDOM($sliceZone, { x: 0, y: 0 });

		t.is($activeSlice, null);
	} else {
		t.fail();
	}

	// @ts-expect-error cleaning up polyfill
	delete document.elementsFromPoint;
});

it("returns slice when Slice is part of raycast", (t) => {
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

	if ($sliceZone) {
		const $activeSlice = getActiveSliceDOM($sliceZone, { x: 0, y: 0 });

		t.true($activeSlice instanceof HTMLElement);
		if ($activeSlice instanceof HTMLElement) {
			t.true($activeSlice.classList.contains("foo"));
		} else {
			t.fail();
		}
	} else {
		t.fail();
	}

	// @ts-expect-error cleaning up polyfill
	delete document.elementsFromPoint;
});
