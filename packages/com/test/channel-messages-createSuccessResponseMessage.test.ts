import test from "ava";

import { createSuccessResponseMessage } from "../src/channel";

const dummyData = { foo: "bar" };

test("creates a valid success response message with default status", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.deepEqual(response, {
		requestID: t.title,
		status: 200,
		msg: "ok",
		data: dummyData,
	});
});

test("creates a valid success response message with status", (t) => {
	const response1 = createSuccessResponseMessage(t.title, dummyData, 201);

	t.deepEqual(response1, {
		requestID: t.title,
		status: 201,
		msg: "created",
		data: dummyData,
	});

	const response2 = createSuccessResponseMessage(t.title, dummyData, 299);

	t.deepEqual(response2, {
		requestID: t.title,
		status: 299,
		msg: "",
		data: dummyData,
	});
});

test("throws when invalid success status is provided", (t) => {
	t.throws(() => createSuccessResponseMessage(t.title, dummyData, 400), {
		instanceOf: TypeError,
	});
});
