import { expect, it } from "vitest"

import {
	ChannelEmitter,
	ChannelNotSetError,
	PortNotSetError,
} from "../src/channel"

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe")

it("throws when accessing unset channel", () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {})

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(() => channelEmitter.channel).toThrowError(ChannelNotSetError)
})

it("returns channel when channel is set", () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {})

	const channel = new MessageChannel()

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = channel

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(channelEmitter.channel).toBe(channel)
})

it("configures port from set channel", () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {})

	const channel = new MessageChannel()

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = channel

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(channelEmitter.port).toBe(channel.port1)
})

it("unsets port when channel is unset", () => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {}, {})

	const channel = new MessageChannel()

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = channel

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(channelEmitter.port).toBe(channel.port1)

	// @ts-expect-error - taking a shortcut by setting protected property
	channelEmitter.channel = null

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(() => channelEmitter.port).toThrowError(PortNotSetError)
})
