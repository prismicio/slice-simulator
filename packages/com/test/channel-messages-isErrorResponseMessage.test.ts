import test from "ava";
import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isErrorResponseMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

test("returns false on request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.false(isErrorResponseMessage(request));
});

test("returns false on success response message", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.false(isErrorResponseMessage(response));
});

test("returns true on error response message", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.true(isErrorResponseMessage(response));
});
