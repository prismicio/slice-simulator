import test from "ava";
import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isResponseMessage,
} from "../src/channel";

const dummyData = { foo: "bar" };
const dummyError = dummyData;

test("returns false on request message", (t) => {
	const request = createRequestMessage(t.title, dummyData);

	t.false(isResponseMessage(request));
});

test("returns true on success response message", (t) => {
	const response = createSuccessResponseMessage(t.title, dummyData);

	t.true(isResponseMessage(response));
});

test("returns true on error response message", (t) => {
	const response = createErrorResponseMessage(t.title, dummyError);

	t.true(isResponseMessage(response));
});
