import { expect, it } from "vitest"

import { ChannelEmitter } from "../src/channel"

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe")

it("returns connected status", () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {})

	expect(channelEmitter.connected).toBe(false)

	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._connected = true

	expect(channelEmitter.connected).toBe(true)
})
