import test from "ava";
import * as sinon from "sinon";

import { EventEmitter } from "../src/lib/EventEmitter";

class StandaloneEventEmitter extends EventEmitter<{ foo: "bar" }> {}

test("registers event handler", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener);

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(eventEmitter._listeners.foo[0][0], listener);
});

test("registers event handler with key", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener, "baz");

	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(eventEmitter._listeners.foo[0][0], listener);
	// @ts-expect-error - taking a shortcut by accessing protected property
	t.is(eventEmitter._listeners.foo[0][1], "baz");
});

test("dispatches event", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener);

	t.is(listener.callCount, 0);

	eventEmitter.emit("foo", "bar");

	t.is(listener.callCount, 1);
});

test("doesn't fail to dispatch when no handler", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	t.notThrows(() => eventEmitter.emit("foo", "bar"));
});

test("unregisters event handler", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener);

	t.is(listener.callCount, 0);

	eventEmitter.off("foo", listener);

	t.is(listener.callCount, 0);

	eventEmitter.emit("foo", "bar");

	t.is(listener.callCount, 0);
});

test("unregisters event handler with key", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	eventEmitter.on("foo", listener, "baz");

	t.is(listener.callCount, 0);

	eventEmitter.off("foo", "baz");

	t.is(listener.callCount, 0);

	eventEmitter.emit("foo", "bar");

	t.is(listener.callCount, 0);
});

test("doesn't fail to unregister when no handler", (t) => {
	const eventEmitter = new StandaloneEventEmitter();

	const listener = sinon.spy();

	t.notThrows(() => eventEmitter.off("foo", listener));
});
