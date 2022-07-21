import { it, expect } from "vitest";

import { createRequestMessage } from "../src/channel";

const dummyData = { foo: "bar" };

it("creates a valid request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.is(typeof request.requestID, "string");
	t.false(isNaN(parseInt(request.requestID)));

	request.requestID = "0";

	t.deepEqual(request, {
		requestID: "0",
		type: t.title,
		data: dummyData,
	});
});

it("handles prefix", (t) => {
	const request = createRequestMessage(t.title, dummyData, "baz");

	t.true(request.requestID.startsWith("baz"));
});
