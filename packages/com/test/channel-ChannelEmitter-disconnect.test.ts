import test from "ava";

import { ChannelEmitter, ChannelNotSetError } from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe");

test("disconnects emitter from receiver by killing channel", (t) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = channel;
	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._connected = true;

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(channelEmitter.channel, channel);
	t.true(channelEmitter.connected);

	channelEmitter.disconnect();

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.throws(() => channelEmitter.channel, { instanceOf: ChannelNotSetError });
	t.false(channelEmitter.connected);
});
