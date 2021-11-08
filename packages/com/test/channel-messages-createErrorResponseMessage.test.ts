import test from "ava";

import { createErrorResponseMessage } from "../src/channel";

const dummyError = { foo: "bar" };

test("creates a valid error response message with default status", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.deepEqual(response, {
		requestID: t.title,
		status: 400,
		msg: "bad request",
		error: dummyError,
	});
});

test("creates a valid error response message with status", (t) => {
	const response1 = createErrorResponseMessage(t.title, dummyError, 401);

	t.deepEqual(response1, {
		requestID: t.title,
		status: 401,
		msg: "unauthorized",
		error: dummyError,
	});

	const response2 = createErrorResponseMessage(t.title, dummyError, 599);

	t.deepEqual(response2, {
		requestID: t.title,
		status: 599,
		msg: "",
		error: dummyError,
	});
});

test("throws when invalid error status is provided", (t) => {
	t.throws(() => createErrorResponseMessage(t.title, dummyError, 200), {
		instanceOf: TypeError,
	});
});
