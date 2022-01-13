import test from "ava";
import * as sinon from "sinon";

import {
	ChannelReceiver,
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	InternalEmitterRequestType,
} from "../src/channel";

class StandaloneChannelReceiver extends ChannelReceiver {}

const dummyData = { foo: "bar" };

test.serial(
	"gets wired to public message events on class instantiation",
	(t) => {
		const channelReceiver = new StandaloneChannelReceiver({});
		// @ts-expect-error - taking a shortcut by accessing protected property
		const onPublicMessageStub = sinon.stub(channelReceiver, "_onPublicMessage");

		const event = new MessageEvent("message", { data: dummyData });
		window.dispatchEvent(event);

		t.is(onPublicMessageStub.callCount, 1);
		t.deepEqual(onPublicMessageStub.getCall(0).args[0], event);

		onPublicMessageStub.restore();
	},
);

test.serial("debug logs messages when on debug mode", (t) => {
	const consoleDebugStub = sinon.stub(console, "debug");

	const channelReceiver = new StandaloneChannelReceiver({}, { debug: true });

	const request = createRequestMessage(t.title, dummyData);

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request });

	t.is(consoleDebugStub.callCount, 2); // 1 for the response, 1 for the request
	t.deepEqual(consoleDebugStub.getCall(0).args[0], request);

	consoleDebugStub.restore();
});

test.serial("doesn't debug log messages when not on debug mode", (t) => {
	const consoleDebugStub = sinon.stub(console, "debug");

	const channelReceiver = new StandaloneChannelReceiver({}, { debug: false });

	const request = createRequestMessage(t.title, dummyData);

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request });

	t.is(consoleDebugStub.callCount, 0);

	consoleDebugStub.restore();
});

test("doens't throw on invalid message received", (t) => {
	const channelReceiver = new StandaloneChannelReceiver({});

	t.notThrows(() => {
		// @ts-expect-error - taking a shortcut by accessing private property
		channelReceiver._onPublicMessage({ data: null });
	});
});

test.serial("throws on other errors", (t) => {
	const consoleDebugStub = sinon
		.stub(console, "debug")
		.throws(new Error(t.title));

	const channelReceiver = new StandaloneChannelReceiver({}, { debug: true });

	const request = createRequestMessage(t.title, dummyData);

	t.throws(
		() => {
			// @ts-expect-error - taking a shortcut by accessing private property
			channelReceiver._onPublicMessage({ data: request });
		},
		{ message: t.title },
	);

	consoleDebugStub.restore();
});

test("accepts connection requests", (t) => {
	const channelReceiver = new StandaloneChannelReceiver({});
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postResponseStub = sinon.stub(channelReceiver, "postResponse");

	const channel = new MessageChannel();

	const request = createRequestMessage(
		InternalEmitterRequestType.Connect,
		dummyData,
	);
	const response = createSuccessResponseMessage(request.requestID, undefined);

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request, ports: [channel.port1] });

	t.is(postResponseStub.callCount, 1);
	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(channelReceiver.port, channel.port1);
	t.deepEqual(postResponseStub.getCall(0).args[0], response);

	postResponseStub.restore();
});

test("rejects non connect requests", (t) => {
	const channelReceiver = new StandaloneChannelReceiver({});
	// @ts-expect-error - taking a shortcut by accessing protected property
	const postResponseStub = sinon.stub(channelReceiver, "postResponse");

	const request = createRequestMessage(t.title, dummyData);
	const response = createErrorResponseMessage(request.requestID, undefined);

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: request });

	t.is(postResponseStub.callCount, 1);
	t.deepEqual(postResponseStub.getCall(0).args[0], response);

	postResponseStub.restore();
});

test("forwards response messages to default message handler when not ready", (t) => {
	const channelReceiver = new StandaloneChannelReceiver({});
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = sinon.stub(channelReceiver, "onMessage");

	const response = createSuccessResponseMessage(t.title, undefined);

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: response });

	t.is(onMessageStub.callCount, 1);
	t.deepEqual(onMessageStub.getCall(0).args[0], { data: response });

	onMessageStub.restore();
});

test("doesn't forward response messages to default message handler once ready", (t) => {
	const channelReceiver = new StandaloneChannelReceiver({});
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = sinon.stub(channelReceiver, "onMessage");
	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._ready = true;

	const response = createSuccessResponseMessage(t.title, undefined);

	// @ts-expect-error - taking a shortcut by accessing private property
	channelReceiver._onPublicMessage({ data: response });

	t.is(onMessageStub.callCount, 0);

	onMessageStub.restore();
});
