import { it, expect, vi } from "vitest";

import { getSliceZoneDOM, simulatorClass, simulatorRootClass } from "../src";

it("returns flagged Slice Zone if any", () => {
	document.body.innerHTML = `<div class="${simulatorClass}"><div data-slice-zone></div></div>`;

	const $sliceZone = getSliceZoneDOM(0);

	expect($sliceZone).toBeInstanceOf(HTMLDivElement);
	expect(($sliceZone as HTMLDivElement).dataset.sliceZone).toBe("");

	document.body.innerHTML = "";
});

it("returns flagged Slice Zone if any and warn if number of children is off", () => {
	vi.stubGlobal("console", { ...console, warn: vi.fn() });

	document.body.innerHTML = `<div class="${simulatorClass}"><div data-slice-zone></div></div>`;

	const $sliceZone = getSliceZoneDOM(1);

	expect($sliceZone).toBeInstanceOf(HTMLDivElement);
	expect(($sliceZone as HTMLDivElement).dataset.sliceZone).toBe("");

	expect(console.warn).toHaveBeenCalledOnce();
	// @ts-expect-error - type is broken
	expect(console.warn.calls[0][0]).toMatchInlineSnapshot(
		'"Flagged SliceZone has an unexpected number of children, found 0 but expected 1. This might lead to unexpected behaviors. Are you sure you tagged the right element?"',
	);

	document.body.innerHTML = "";

	vi.restoreAllMocks();
});

it("returns null if simulator class is not found", () => {
	document.body.innerHTML = "";

	const $sliceZone = getSliceZoneDOM(0);

	expect($sliceZone).toBeNull();

	document.body.innerHTML = "";
});

it("returns null if simulator root class is not found", () => {
	document.body.innerHTML = `<div class="${simulatorClass}"></div>`;

	const $sliceZone = getSliceZoneDOM(0);

	expect($sliceZone).toBeNull();

	document.body.innerHTML = "";
});

it("returns null if simulator root has no children but children are expected", () => {
	document.body.innerHTML = `<div class="${simulatorClass}"><div class="${simulatorRootClass}"></div></div>`;

	const $sliceZone = getSliceZoneDOM(1);

	expect($sliceZone).toBeNull();

	document.body.innerHTML = "";
});

it("returns simulator root when no children are expected", () => {
	document.body.innerHTML = `<div class="${simulatorClass}"><div class="${simulatorRootClass}"></div></div>`;

	const $sliceZone = getSliceZoneDOM(0);

	expect($sliceZone).toBeInstanceOf(HTMLDivElement);
	expect(
		($sliceZone as HTMLDivElement).classList.contains(simulatorRootClass),
	).toBe(true);

	document.body.innerHTML = "";
});

it("returns simulator root when matching the expected number of children", () => {
	document.body.innerHTML = `<div class="${simulatorClass}">
	<div class="${simulatorRootClass}">
		<section></section><section></section>
	</div>
</div>`;

	const $sliceZone = getSliceZoneDOM(2);

	expect($sliceZone).toBeInstanceOf(HTMLDivElement);
	expect(
		($sliceZone as HTMLDivElement).classList.contains(simulatorRootClass),
	).toBe(true);

	document.body.innerHTML = "";
});

it("returns first element matching the expected number of children from simulator root", () => {
	document.body.innerHTML = `<div class="${simulatorClass}">
	<div class="${simulatorRootClass}">
		<div class="slicezone">
			<section></section><section></section>
		</div>
	</div>
</div>`;

	const $sliceZone = getSliceZoneDOM(2);

	expect($sliceZone).toBeInstanceOf(HTMLDivElement);
	expect(($sliceZone as HTMLDivElement).classList.contains("slicezone")).toBe(
		true,
	);

	document.body.innerHTML = "";
});

it("returns null when Slice Zone is too deep", () => {
	document.body.innerHTML = `<div class="${simulatorClass}">
	<div class="${simulatorRootClass}">
		<div><div><div><div>
			<div class="slicezone">
				<section></section><section></section>
			</div>
		</div></div></div></div>
	</div>
</div>`;

	const $sliceZone = getSliceZoneDOM(2);

	expect($sliceZone).toBeNull();

	document.body.innerHTML = "";
});
