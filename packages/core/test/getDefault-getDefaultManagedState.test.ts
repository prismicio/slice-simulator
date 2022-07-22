import { it, expect } from "vitest";

import { getDefaultManagedState } from "../src";

it("returns default managed state", () => {
	expect(getDefaultManagedState()).toMatchInlineSnapshot(`
		{
		  "data": null,
		  "error": null,
		  "status": "pending",
		}
	`);
});
