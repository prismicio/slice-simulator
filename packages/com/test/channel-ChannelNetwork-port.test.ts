import test from "ava";
import * as sinon from "sinon";

import { sleep } from "./__testutils__/sleep";

import {
	ChannelNetwork,
	createRequestMessage,
	PortNotSetError,
} from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };

test("throws when accessing unset port", (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.throws(() => channelNetwork.port, { instanceOf: PortNotSetError });
});

test("listens to new port messages automatically", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});
	const spiedChannelNetwork = sinon.spy(channelNetwork);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	spiedChannelNetwork.port = channel.port2;

	const request = createRequestMessage(t.title, dummyData);

	channel.port1.postMessage(request);

	await sleep(10);

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(spiedChannelNetwork.onMessage.callCount, 1);
	// @ts-expect-error - taking a shortcut by accessing protected property
	t.deepEqual(spiedChannelNetwork.onMessage.getCall(0).args[0].data, request);
});

test("stops listening to old port after new port automatically", async (t) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});
	const spiedChannelNetwork = sinon.spy(channelNetwork);

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	spiedChannelNetwork.port = channel.port2;

	const request1 = createRequestMessage("foo", dummyData);

	channel.port1.postMessage(request1);

	await sleep(10);

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(spiedChannelNetwork.onMessage.callCount, 1);
	t.deepEqual(
		// @ts-expect-error - taking a shortcut by accessing protected property
		spiedChannelNetwork.onMessage.getCall(0).args[0].data,
		request1,
	);

	// @ts-expect-error - taking a shortcut by setting protected property
	spiedChannelNetwork.port = null;

	const request2 = createRequestMessage("bar", dummyData);

	channel.port1.postMessage(request2);

	await sleep(10);

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(spiedChannelNetwork.onMessage.callCount, 1);
});
