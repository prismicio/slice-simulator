import test from "ava";
import * as sinon from "sinon";

import {
	ChannelEmitter,
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	InternalReceiverRequestType,
} from "../src/channel";

class StandaloneEmitterEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe");

const dummyData = { foo: "bar" };

test.serial(
	"gets wired to public message events on class instantiation",
	(t) => {
		const channelEmitter = new StandaloneEmitterEmitter(iframe, {});
		// @ts-expect-error - taking a shortcut by accessing protected property
		const onPublicMessageStub = sinon.stub(channelEmitter, "_onPublicMessage");

		const event = new MessageEvent("message", {
			data: dummyData,
			source: iframe.contentWindow,
		});
		window.dispatchEvent(event);

		t.is(onPublicMessageStub.callCount, 1);
		t.deepEqual(onPublicMessageStub.getCall(0).args[0], event);

		onPublicMessageStub.restore();
	},
);

test.serial("debug logs messages when on debug mode", async (t) => {
	const consoleDebugStub = sinon.stub(console, "debug");

	const channelEmitter = new StandaloneEmitterEmitter(
		iframe,
		{},
		{ debug: true },
	);

	const request = createRequestMessage(t.title, dummyData);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	t.is(
		consoleDebugStub.callCount,
		2,
		"calls `console.debug` twice: 1 for the response, 1 for the request",
	);
	t.deepEqual(consoleDebugStub.getCall(0).args[0], request);

	consoleDebugStub.restore();
});

test.serial("doesn't debug log messages when not on debug mode", async (t) => {
	const consoleDebugStub = sinon.stub(console, "debug");

	const channelEmitter = new StandaloneEmitterEmitter(
		iframe,
		{},
		{ debug: false },
	);

	const request = createRequestMessage(t.title, dummyData);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	t.is(consoleDebugStub.callCount, 0);

	consoleDebugStub.restore();
});

test("ignores event not coming from target", async (t) => {
	// Using debug mode as a way to make sure function returns early
	const consoleDebugStub = sinon.stub(console, "debug");

	const channelEmitter = new StandaloneEmitterEmitter(
		iframe,
		{},
		{ debug: true },
	);

	const request = createRequestMessage(t.title, dummyData);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({ data: request });

	t.false(consoleDebugStub.called);

	consoleDebugStub.restore();
});

test("doens't throw on invalid message received", async (t) => {
	const channelEmitter = new StandaloneEmitterEmitter(iframe, {});

	await t.notThrowsAsync(
		// @ts-expect-error - taking a shortcut by accessing private property
		channelEmitter._onPublicMessage({
			data: null,
			source: iframe.contentWindow,
		}),
	);
});

test.serial("throws on other errors", async (t) => {
	const consoleDebugStub = sinon
		.stub(console, "debug")
		.throws(new Error(t.title));

	const channelEmitter = new StandaloneEmitterEmitter(
		iframe,
		{},
		{ debug: true },
	);

	const request = createRequestMessage(t.title, dummyData);

	await t.throwsAsync(
		// @ts-expect-error - taking a shortcut by accessing private property
		channelEmitter._onPublicMessage({
			data: request,
			source: iframe.contentWindow,
		}),
		{ message: t.title },
	);

	consoleDebugStub.restore();
});

test("accepts ready requests", async (t) => {
	const channelEmitter = new StandaloneEmitterEmitter(iframe, {});

	const request = createRequestMessage(
		InternalReceiverRequestType.Ready,
		dummyData,
	);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	// @ts-expect-error - taking a shortcut by accessing private property
	t.is(channelEmitter._receiverReady, request.requestID);
});

test("accepts ready requests and call `receiverReadyCallback` when available", async (t) => {
	const channelEmitter = new StandaloneEmitterEmitter(iframe, {});
	// @ts-expect-error - taking a shortcut by accessing private property
	channelEmitter._receiverReadyCallback = () => {
		/* ... */
	};
	const receiverReadyCallbackStub = sinon.stub(
		channelEmitter,
		// @ts-expect-error - taking a shortcut by accessing private property
		"_receiverReadyCallback",
	);

	const request = createRequestMessage(
		InternalReceiverRequestType.Ready,
		dummyData,
	);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	// @ts-expect-error - taking a shortcut by accessing private property
	t.is(channelEmitter._receiverReady, request.requestID);
	t.is(receiverReadyCallbackStub.callCount, 1);

	receiverReadyCallbackStub.restore();
});

test("rejects non-ready requests", async (t) => {
	const channelEmitter = new StandaloneEmitterEmitter(iframe, {});
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postResponseStub = sinon.stub(channelEmitter, "postResponse");

	const request = createRequestMessage(t.title, dummyData);
	const response = createErrorResponseMessage(request.requestID, undefined);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: request,
		source: iframe.contentWindow,
	});

	t.is(postResponseStub.callCount, 1);
	t.deepEqual(postResponseStub.getCall(0).args[0], response);

	postResponseStub.restore();
});

test("ignores response messages", async (t) => {
	const channelEmitter = new StandaloneEmitterEmitter(iframe, {});
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = sinon.stub(channelEmitter, "onMessage");
	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._ready = true;

	const response = createSuccessResponseMessage(t.title, undefined);

	// @ts-expect-error - taking a shortcut by accessing private property
	await channelEmitter._onPublicMessage({
		data: response,
		source: iframe.contentWindow,
	});

	t.is(onMessageStub.callCount, 0);

	onMessageStub.restore();
});
