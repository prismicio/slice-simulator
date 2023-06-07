import { expect, it } from "vitest";

import { getDefaultMessage } from "../src/kit";

it("returns default message", () => {
	expect(getDefaultMessage()).toMatchInlineSnapshot('""');
});
