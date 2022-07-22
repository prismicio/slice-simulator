import { it, expect } from "vitest";

import { getDefaultSlices } from "../src";

it("returns default slices", () => {
	expect(getDefaultSlices()).toMatchInlineSnapshot("[]");
});
