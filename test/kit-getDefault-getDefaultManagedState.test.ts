import { expect, it } from "vitest";

import { getDefaultManagedState } from "../src/kit";

it("returns default managed state", () => {
	expect(getDefaultManagedState()).toMatchInlineSnapshot(`
		{
		  "data": null,
		  "error": null,
		  "status": "pending",
		}
	`);
});
