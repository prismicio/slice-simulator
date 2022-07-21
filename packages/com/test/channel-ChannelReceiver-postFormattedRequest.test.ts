import { it, expect, vi } from "vitest";

import { ChannelReceiver, NotReadyError } from "../src/channel";

class StandaloneChannelReceiver extends ChannelReceiver {}

const dummyData = { foo: "bar" };

it("throws when not ready", (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver({});

	expect(() => {
		// @ts-expect-error - taking a shortcut by accessing protected property
		channelReceiver.postFormattedRequest(ctx.meta.name, dummyData);
	}).toThrowError(NotReadyError);
});

it("forwards request to default post request handler once ready", (ctx) => {
	const channelReceiver = new StandaloneChannelReceiver(
		{},
		{ requestIDPrefix: ctx.meta.name },
	);

	const postRequestStub = vi.fn();
	// @ts-expect-error - taking a shortcut by accessing protected property
	channelReceiver.postRequest = postRequestStub;
	// @ts-expect-error - taking a shortcut by setting private property
	channelReceiver._ready = true;

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelReceiver.postFormattedRequest(ctx.meta.name, dummyData, {
		timeout: 1000,
	});

	expect(postRequestStub).toHaveBeenCalledOnce();
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][0].requestID.replace(/\d+/, "")).toBe(
		ctx.meta.name,
	);
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][0].type, ctx.meta.name);
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][0].data).toStrictEqual(dummyData);
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][1]).toBeUndefined();
	// @ts-expect-error - type is broken
	expect(postRequestStub.calls[0][2]).toStrictEqual({ timeout: 1000 });
});
