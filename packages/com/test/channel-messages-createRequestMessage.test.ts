import test from "ava";

import { createRequestMessage } from "../src/channel";

const dummyData = { foo: "bar" };

test("creates a valid request message", (t) => {
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

test("handles prefix", (t) => {
	const request = createRequestMessage(t.title, dummyData, "baz");

	t.true(request.requestID.startsWith("baz"));
});
