import { it, expect, vi } from "vitest";

import { ChannelEmitter, NotReadyError } from "../src/channel";

class StandaloneChannelEmitter extends ChannelEmitter {}

const iframe = document.createElement("iframe");

const dummyData = { foo: "bar" };

it("throws when not ready", (ctx) => {
	const channelEmitter = new StandaloneChannelEmitter(iframe, {});

	expect(() => {
		// @ts-expect-error - taking a shortcut by accessing protected property
		channelEmitter.postFormattedRequest(ctx.meta.name, dummyData);
	}).toThrowError(NotReadyError);
});

it("forwards request to default post request handler once ready", (ctx) => {
	const channelEmitter = new StandaloneChannelEmitter(
		iframe,
		{},
		{ requestIDPrefix: ctx.meta.name },
	);

	const postRequestStub = vi.fn();
	// @ts-expect-error - taking a shortcut by accessing protected property
	vi.spyOn(channelEmitter, "postRequest").mockImplementation(postRequestStub);
	// @ts-expect-error - taking a shortcut by setting private property
	channelEmitter._connected = true;

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelEmitter.postFormattedRequest(ctx.meta.name, dummyData, {
		timeout: 1000,
	});

	expect(postRequestStub).toHaveBeenCalledOnce();
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][0].requestID.replace(/\d+/, "")).toBe(
		ctx.meta.name,
	);
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][0].type).toBe(ctx.meta.name);
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][0].data).toBe(dummyData);
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][1]).toBeUndefined();
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][2]).toStrictEqual({ timeout: 1000 });
});
