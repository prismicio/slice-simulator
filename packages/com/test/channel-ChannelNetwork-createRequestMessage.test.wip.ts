import { it, expect } from "vitest";

import { ChannelNetwork } from "../src/channel";

class StandaloneChannelNetwork extends ChannelNetwork {}

const dummyData = { foo: "bar" };

it("creates request message with instance prefix", (t) => {
	const channelNetwork = new StandaloneChannelNetwork(
		{},
		{ requestIDPrefix: t.title },
	);

	const request = channelNetwork.createRequestMessage("test", dummyData);

	t.is(request.requestID.replace(/\d+/, ""), t.title);
});
