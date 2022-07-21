import { it, expect } from "vitest";
import * as sinon from "sinon";

import { getSliceZoneDOM, simulatorClass, simulatorRootClass } from "../src";

it("returns flagged Slice Zone if any", (t) => {
	document.body.innerHTML = `<div class="${simulatorClass}"><div data-slice-zone></div></div>`;

	const $sliceZone = getSliceZoneDOM(0);
	t.true($sliceZone instanceof HTMLDivElement);
	if ($sliceZone instanceof HTMLDivElement) {
		t.is($sliceZone.dataset.sliceZone, "");
	} else {
		t.fail();
	}

	document.body.innerHTML = "";
});

test.serial(
	"returns flagged Slice Zone if any and warn if number of children is off",
	(t) => {
		const consoleWarnStub = sinon.stub(console, "warn");
		document.body.innerHTML = `<div class="${simulatorClass}"><div data-slice-zone></div></div>`;

		const $sliceZone = getSliceZoneDOM(1);
		t.true($sliceZone instanceof HTMLDivElement);
		if ($sliceZone instanceof HTMLDivElement) {
			t.is($sliceZone.dataset.sliceZone, "");
		} else {
			t.fail();
		}

		t.is(consoleWarnStub.callCount, 1);
		t.true(
			consoleWarnStub
				.getCall(0)
				.args[0].includes("unexpected number of children"),
		);

		document.body.innerHTML = "";
		consoleWarnStub.restore();
	},
);

it("returns null if simulator class is not found", (t) => {
	document.body.innerHTML = "";

	const $sliceZone = getSliceZoneDOM(0);

	t.is($sliceZone, null);

	document.body.innerHTML = "";
});

it("returns null if simulator root class is not found", (t) => {
	document.body.innerHTML = `<div class="${simulatorClass}"></div>`;

	const $sliceZone = getSliceZoneDOM(0);

	t.is($sliceZone, null);

	document.body.innerHTML = "";
});

it("returns null if simulator root has no children but children are expected", (t) => {
	document.body.innerHTML = `<div class="${simulatorClass}"><div class="${simulatorRootClass}"></div></div>`;

	const $sliceZone = getSliceZoneDOM(1);

	t.is($sliceZone, null);

	document.body.innerHTML = "";
});

it("returns simulator root when no children are expected", (t) => {
	document.body.innerHTML = `<div class="${simulatorClass}"><div class="${simulatorRootClass}"></div></div>`;

	const $sliceZone = getSliceZoneDOM(0);

	t.true($sliceZone instanceof HTMLDivElement);
	if ($sliceZone instanceof HTMLDivElement) {
		t.true($sliceZone.classList.contains(simulatorRootClass));
	} else {
		t.fail();
	}

	document.body.innerHTML = "";
});

it("returns simulator root when matching the expected number of children", (t) => {
	document.body.innerHTML = `<div class="${simulatorClass}">
	<div class="${simulatorRootClass}">
		<section></section><section></section>
	</div>
</div>`;

	const $sliceZone = getSliceZoneDOM(2);

	t.true($sliceZone instanceof HTMLDivElement);
	if ($sliceZone instanceof HTMLDivElement) {
		t.true($sliceZone.classList.contains(simulatorRootClass));
	} else {
		t.fail();
	}

	document.body.innerHTML = "";
});

it("returns first element matching the expected number of children from simulator root", (t) => {
	document.body.innerHTML = `<div class="${simulatorClass}">
	<div class="${simulatorRootClass}">
		<div class="slicezone">
			<section></section><section></section>
		</div>
	</div>
</div>`;

	const $sliceZone = getSliceZoneDOM(2);

	t.true($sliceZone instanceof HTMLDivElement);
	if ($sliceZone instanceof HTMLDivElement) {
		t.true($sliceZone.classList.contains("slicezone"));
	} else {
		t.fail();
	}

	document.body.innerHTML = "";
});

it("returns null when Slice Zone is too deep", (t) => {
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

	t.is($sliceZone, null);

	document.body.innerHTML = "";
});
