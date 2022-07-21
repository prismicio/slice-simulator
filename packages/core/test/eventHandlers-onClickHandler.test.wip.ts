import { it, expect } from "vitest";
import * as sinon from "sinon";

import { onClickHandler } from "../src";

const a = document.createElement("a");
const div = document.createElement("div");

it("does nothing when path is absent", (t) => {
	const event = {
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy(),
	};

	onClickHandler(event as unknown as MouseEvent);

	t.is(event.preventDefault.callCount, 0);
	t.is(event.stopPropagation.callCount, 0);
});

it("prevents default and stops propagation when path contains a close HTMLAnchorElement", (t) => {
	const event = {
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy(),
		path: [div, a, div, div, div, div],
	};

	onClickHandler(event as unknown as MouseEvent);

	t.is(event.preventDefault.callCount, 1);
	t.is(event.stopPropagation.callCount, 1);
});

it("does nothing when path doesn't contain a close HTMLAnchorElement", (t) => {
	const event = {
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy(),
		path: [div, div, div, div, div, a],
	};

	onClickHandler(event as unknown as MouseEvent);

	t.is(event.preventDefault.callCount, 0);
	t.is(event.stopPropagation.callCount, 0);
});
