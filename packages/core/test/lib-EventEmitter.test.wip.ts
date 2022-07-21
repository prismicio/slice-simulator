import { it, expect } from "vitest";
import * as sinon from "sinon";

import { EventEmitter } from "../src/lib/EventEmitter";

class StandaloneEventEmitter extends EventEmitter<{ foo: "bar" }> {}

it("registers event handler", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener);

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(eventEmitter._listeners.foo[0][0], listener);
});

it("registers event handler with key", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener, "baz");

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(eventEmitter._listeners.foo[0][0], listener);
	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(eventEmitter._listeners.foo[0][1], "baz");
});

it("dispatches event", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener);

	t.is(listener.callCount, 0);

	eventEmitter.emit("foo", "bar");

	t.is(listener.callCount, 1);
});

it("doesn't fail to dispatch when no handler", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	t.notThrows(() => eventEmitter.emit("foo", "bar"));
});

it("unregisters event handler", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener);

	t.is(listener.callCount, 0);

	eventEmitter.off("foo", listener);

	t.is(listener.callCount, 0);

	eventEmitter.emit("foo", "bar");

	t.is(listener.callCount, 0);
});

it("unregisters event handler with key", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener, "baz");

	t.is(listener.callCount, 0);

	eventEmitter.off("foo", "baz");

	t.is(listener.callCount, 0);

	eventEmitter.emit("foo", "bar");

	t.is(listener.callCount, 0);
});

it("doesn't fail to unregister when no handler", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	t.notThrows(() => eventEmitter.off("foo", listener));
});
