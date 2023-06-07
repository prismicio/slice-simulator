import { it, expect, vi } from "vitest";

import { ChannelNetwork, createSuccessResponseMessage } from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };

it("uses provided post message method", (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork({}, {});

	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	const onmessage = (event: MessageEvent<unknown>) => {
		expect(event.data).toStrictEqual(response);
	};

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelNetwork.postResponse(response, (response) => {
		onmessage({ data: response } as MessageEvent<unknown>);
	});
});

it("debug logs messages when on debug mode", (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn() });

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: true });

	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelNetwork.postResponse(response, () => undefined);

	expect(console.debug).toHaveBeenCalledOnce();

	vi.restoreAllMocks();
});

it("doesn't debug log messages when not on debug mode", (ctx) => {
	vi.stubGlobal("console", { ...console, debug: vi.fn() });

	const channelNetwork = new StandaloneChannelNetwork({}, { debug: false });

	const response = createSuccessResponseMessage(ctx.meta.name, dummyData);

	// @ts-expect-error - taking a shortcut by accessing protected property
	channelNetwork.postResponse(response, () => undefined);

	expect(console.debug).not.toHaveBeenCalled();

	vi.restoreAllMocks();
});
