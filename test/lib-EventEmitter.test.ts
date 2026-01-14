import { expect, it, vi } from "vitest"

import { EventEmitter } from "../src/lib/EventEmitter"

class StandaloneEventEmitter extends EventEmitter<{ foo: "bar" }> {}

it("registers event handler", () => {
	const eventEmitter = new StandaloneEventEmitter()

	const listener = vi.fn()

	eventEmitter.on("foo", listener)

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(eventEmitter._listeners.foo[0][0]).toBe(listener)
})

it("registers event handler with key", () => {
	const eventEmitter = new StandaloneEventEmitter()

	const listener = vi.fn()

	eventEmitter.on("foo", listener, "baz")

	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(eventEmitter._listeners.foo[0][0]).toBe(listener)
	// @ts-expect-error - taking a shortcut by accessing protected property
	expect(eventEmitter._listeners.foo[0][1]).toBe("baz")
})

it("dispatches event", () => {
	const eventEmitter = new StandaloneEventEmitter()

	const listener = vi.fn()

	eventEmitter.on("foo", listener)

	expect(listener).not.toHaveBeenCalled()

	eventEmitter.emit("foo", "bar")

	expect(listener).toHaveBeenCalledOnce()
})

it("doesn't fail to dispatch when no handler", () => {
	const eventEmitter = new StandaloneEventEmitter()

	expect(() => eventEmitter.emit("foo", "bar")).not.toThrowError()
})

it("unregisters event handler", () => {
	const eventEmitter = new StandaloneEventEmitter()

	const listener = vi.fn()

	eventEmitter.on("foo", listener)

	expect(listener).not.toHaveBeenCalled()

	eventEmitter.emit("foo", "bar")

	expect(listener).toHaveBeenCalledOnce()

	eventEmitter.off("foo", listener)

	expect(listener).toHaveBeenCalledOnce()

	eventEmitter.emit("foo", "bar")

	expect(listener).toHaveBeenCalledOnce()
})

it("unregisters event handler with key", () => {
	const eventEmitter = new StandaloneEventEmitter()

	const listener = vi.fn()

	eventEmitter.on("foo", listener, "baz")

	expect(listener).not.toHaveBeenCalled()

	eventEmitter.emit("foo", "bar")

	expect(listener).toHaveBeenCalledOnce()

	eventEmitter.off("foo", "baz")

	expect(listener).toHaveBeenCalledOnce()

	eventEmitter.emit("foo", "bar")

	expect(listener).toHaveBeenCalledOnce()
})

it("doesn't fail to unregister when no handler", () => {
	const eventEmitter = new StandaloneEventEmitter()

	const listener = vi.fn()

	expect(() => eventEmitter.off("foo", listener)).not.toThrowError()
})
