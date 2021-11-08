import test from "ava";
import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isRequestMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

test("returns true on request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.true(isRequestMessage(request));
});

test("returns false on success response message", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.false(isRequestMessage(response));
});

test("returns false on error response message", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.false(isRequestMessage(response));
});
