import test from "ava";

import { getDefaultManagedState, StateManagerStatus } from "../src";

test("returns default managed state", (t) => {
	t.deepEqual(getDefaultManagedState(), {
		data: null,
		status: StateManagerStatus.Pending,
		error: null,
	});
});
