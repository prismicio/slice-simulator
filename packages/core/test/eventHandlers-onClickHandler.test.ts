import { it, expect, vi } from "vitest";

import { onClickHandler } from "../src";

const a = document.createElement("a");
const div = document.createElement("div");

it("does nothing when path is absent", () => {
	const event = {
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
	};

	onClickHandler(event as unknown as MouseEvent);

	expect(event.preventDefault).not.toHaveBeenCalled();
	expect(event.stopPropagation).not.toHaveBeenCalled();
});

it("prevents default and stops propagation when path contains a close HTMLAnchorElement", () => {
	const event = {
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
		path: [div, a, div, div, div, div],
	};

	onClickHandler(event as unknown as MouseEvent);

	expect(event.preventDefault).toHaveBeenCalledOnce();
	expect(event.stopPropagation).toHaveBeenCalledOnce();
});

it("does nothing when path doesn't contain a close HTMLAnchorElement", () => {
	const event = {
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
		path: [div, div, div, div, div, a],
	};

	onClickHandler(event as unknown as MouseEvent);

	expect(event.preventDefault).not.toHaveBeenCalled();
	expect(event.stopPropagation).not.toHaveBeenCalled();
});
