import { it, expect } from "vitest";

import { ChannelEmitter, ChannelNotSetError } from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe");

it("disconnects emitter from receiver by killing channel", () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = channel;
	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._connected = true;

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(channelEmitter.channel).toBe(channel);
	expect(channelEmitter.connected).toBe(true);

	channelEmitter.disconnect();

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(() => channelEmitter.channel).toThrowError(ChannelNotSetError);
	expect(channelEmitter.connected).toBe(false);
});
