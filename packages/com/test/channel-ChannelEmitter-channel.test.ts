import test from "ava";

import {
	ChannelEmitter,
	PortNotSetError,
	ChannelNotSetError,
} from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe");

test("throws when accessing unset channel", (t) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.throws(() => channelEmitter.channel, { instanceOf: ChannelNotSetError });
});

test("returns channel when channel is set", (t) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = channel;

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(channelEmitter.channel, channel);
});

test("configures port from set channel", (t) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = channel;

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(channelEmitter.port, channel.port1);
});

test("unsets port when channel is unset", (t) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	const channel = new MessageChannel();

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = channel;

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(channelEmitter.port, channel.port1);

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = null;

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.throws(() => channelEmitter.port, { instanceOf: PortNotSetError });
});
