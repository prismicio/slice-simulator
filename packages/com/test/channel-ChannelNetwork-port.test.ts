import { it, expect, vi } from "vitest";

import { sleep } from "./__testutils__/sleep";

import {
	ChannelNetwork,
	createRequestMessage,
	PortNotSetError,
} from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };

it("throws when accessing unset port", () => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(() => channelNetwork.port).toThrowError(PortNotSetError);
});

it("listens to new port messages automatically", async (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = vi.spyOn(channelNetwork, "onMessage");

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request = createRequestMessage(ctx.meta.name, dummyData);

	channel.port1.postMessage(request);

	await sleep(10);

	expect(onMessageStub).toHaveBeenCalledOnce();
	// @ts-expect-error - type is broken
	expect(onMessageStub.calls[0][0].data).toStrictEqual(request);
});

it("stops listening to old port after new port automatically", async () => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});
	// @ts-expect-error - taking a shortcut by accessing protected property
	const onMessageStub = vi.spyOn(channelNetwork, "onMessage");

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = channel.port2;

	const request1 = createRequestMessage("foo", dummyData);

	channel.port1.postMessage(request1);

	await sleep(10);

	expect(onMessageStub).toHaveBeenCalledOnce();
	// @ts-expect-error - type is broken
	expect(onMessageStub.mock.calls[0][0].data).toStrictEqual(request1);

	// @ts-expect-error - taking a shortcut by setting protected property
	channelNetwork.port = null;

	const request2 = createRequestMessage("bar", dummyData);

	channel.port1.postMessage(request2);

	await sleep(10);

	expect(onMessageStub).toHaveBeenCalledOnce();
});
