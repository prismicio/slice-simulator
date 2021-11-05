import test from "ava";
import * as sinon from "sinon";

import {
	ChannelNetwork,
	createErrorResponseMessage,
	createSuccessResponseMessage,
	PortNotSetError,
} from "../src/channel";
import { sleep } from "./__testutils__/sleep";

class StandaloneChannelNetwork extends ChannelNetwork {}

test.serial.before(() => {
	sinon.restore();
});

test("throws when accessing unset port", (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.throws(() => channelNetwork.port, { instanceOf: PortNotSetError });
});

test.serial("listens to new port messages automatically", async (t) => {
	const consoleWarnStub = sinon.stub(console, "warn");

	const channelNetwork = new StandaloneChannelNetwork({}, {});
	const spiedChannelNetwork = sinon.spy(channelNetwork);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	spiedChannelNetwork.port = channel.port2;

	channel.port1.postMessage(t.title);

	await sleep();

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(spiedChannelNetwork.onMessage.callCount, 1);
	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(spiedChannelNetwork.onMessage.getCall(0).args[0].data, t.title);

	consoleWarnStub.restore();
});

test.serial(
	"stops listening to old port after new port automatically",
	async (t) => {
		const consoleWarnStub = sinon.stub(console, "warn");

		const channelNetwork = new StandaloneChannelNetwork({}, {});
		const spiedChannelNetwork = sinon.spy(channelNetwork);

		const channel = new MessageChannel();

		// @ts-expect-error - taking a shortcut by setting protected property
		spiedChannelNetwork.port = channel.port2;

		channel.port1.postMessage("test");

		await sleep();

		// @ts-expect-error - taking a shortcut by accessing protected property
		t.is(spiedChannelNetwork.onMessage.callCount, 1);
		// @ts-expect-error - taking a shortcut by accessing protected property
		t.is(spiedChannelNetwork.onMessage.getCall(0).args[0].data, "test");

		// @ts-expect-error - taking a shortcut by setting protected property
		spiedChannelNetwork.port = null;

		channel.port1.postMessage("test2");

		await sleep();

		// @ts-expect-error - taking a shortcut by accessing protected property
		t.is(spiedChannelNetwork.onMessage.callCount, 1);

		consoleWarnStub.restore();
	},
);

test("creates request message with instance prefix", (t) => {
	const channelNetwork = new StandaloneChannelNetwork(
		{},
		{ requestIDPrefix: t.title },
	);

	const request = channelNetwork.createRequestMessage("test", undefined);

	t.is(request.requestID.replace(/\d+/, ""), t.title);
});

test("posts valid requests to its partner and receive valid response", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(t.title, undefined);
	const response = createSuccessResponseMessage(request.requestID, undefined);

	channel.port1.onmessage = (event) => {
		t.deepEqual(event.data, request);

		channel.port1.postMessage(response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	const receivedResponse = await channelNetwork.postRequest(request);

	t.deepEqual(receivedResponse, response);
});

test("throws on error response", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = channelNetwork.createRequestMessage(t.title, undefined);
	const response = createErrorResponseMessage(request.requestID, undefined);

	channel.port1.onmessage = (event) => {
		t.deepEqual(event.data, request);

		channel.port1.postMessage(response);
	};

	try {
		// @ts-expect-error - taking a shortcut by accessing protected property
		await channelNetwork.postRequest(request);
		t.fail("Expected `channelNetwork.postRequest()` to throw");
	} catch (receivedResponse) {
		t.deepEqual(receivedResponse, response);
	}
});
