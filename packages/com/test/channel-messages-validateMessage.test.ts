import test from "ava";

import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	validateMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

test("validates valid request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.notThrows(() => validateMessage(request));
});

test("validates valid success response message", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.notThrows(() => validateMessage(response));
});

test("validates valid error response message", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.notThrows(() => validateMessage(response));
});

test("throws on non-object", (t) => {
	const message1 = 1;

	t.throws(() => validateMessage(message1), { instanceOf: TypeError });

	const message2 = null;

	t.throws(() => validateMessage(message2), { instanceOf: TypeError });
});

test("throws on invalid object", (t) => {
	const message1 = {};

	t.throws(() => validateMessage(message1), { instanceOf: TypeError });

	const message2 = {
		foo: "bar",
	};

	t.throws(() => validateMessage(message2), { instanceOf: TypeError });
});

test("throws on invalid requestID", (t) => {
	const message: Record<string, unknown> = createRequestMessage(
		t.title,
		dummyData,
	);
	message.requestID = 1;

	t.throws(() => validateMessage(message), { instanceOf: TypeError });
});
