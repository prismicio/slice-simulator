import { expect, it } from "vitest";

import { ChannelNetwork } from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };

it("creates request message with instance prefix", (ctx) => {
	const channelNetwork = new StandaloneChannelNetwork(
		{},
		{ requestIDPrefix: ctx.meta.name },
	);

	const request = channelNetwork.createRequestMessage("test", dummyData);

	expect(request.requestID.replace(/\d+/, "")).toBe(ctx.meta.name);
});
