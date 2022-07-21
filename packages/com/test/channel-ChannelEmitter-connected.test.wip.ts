import { it, expect } from "vitest";

import { ChannelEmitter } from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe");

it("returns connected status", (t) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	t.false(channelEmitter.connected);

	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._connected = true;

	t.true(channelEmitter.connected);
});
