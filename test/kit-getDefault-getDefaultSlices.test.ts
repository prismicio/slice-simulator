import { expect, it } from "vitest";

import { getDefaultSlices } from "../src/kit";

it("returns default slices", () => {
	expect(getDefaultSlices()).toMatchInlineSnapshot("[]");
});
