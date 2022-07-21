import { it, expect } from "vitest";

import { getDefaultManagedState, StateManagerStatus } from "../src";

it("returns default managed state", (ctx) => {
	t.deepEqual(getDefaultManagedState(), {
		data: null,
		status: StateManagerStatus.Pending,
		error: null,
	});
});
