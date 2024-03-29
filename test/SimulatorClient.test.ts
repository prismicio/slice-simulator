import { expect, it, vi } from "vitest";

import {
	APIRequestType,
	ClientRequestType,
	ClientTransactions,
	SimulatorClient,
} from "../src";
import { createRequestMessage } from "../src/channel";

const iframe = document.createElement("iframe");

it("instantiates correctly", () => {
	expect(
		() =>
			new SimulatorClient(iframe, {
				[APIRequestType.SetActiveSlice]: (_req, res) => {
					return res.success();
				},
				[APIRequestType.SetSliceZoneSize]: (_req, res) => {
					return res.success();
				},
			}),
	).not.toThrowError();
});

it("instantiates correctly with defaults", () => {
	const simulatorClient = new SimulatorClient(iframe);

	const [req, res] = [
		createRequestMessage(APIRequestType.SetActiveSlice, null),
		{
			success: vi.fn(),
			error: vi.fn(),
		},
	];

	simulatorClient.requestHandlers[APIRequestType.SetActiveSlice](req, res);

	expect(res.success).toHaveBeenCalledOnce();
	expect(res.error).not.toHaveBeenCalled();
});

it("registers instance on window object", () => {
	expect("prismic" in window).toBe(false);

	const simulatorClient = new SimulatorClient(iframe, {}, { debug: true });
	expect(window?.prismic?.sliceSimulator?.client?.[0]).toBe(simulatorClient);

	delete window.prismic;
});

const callsPostFormattedRequestCorrectly = <
	TRequestType extends ClientRequestType,
	TRequestData extends ClientTransactions[TRequestType]["request"]["data"],
>(
	requestType: TRequestType,
	requestData: TRequestData,
): [string, () => Promise<void>] => [
	`\`SimulatorClient.${requestType}()\` calls \`postFormattedRequest\` correctly`,
	async () => {
		const simulatorClient = new SimulatorClient(iframe);

		const postFormattedRequestStub = vi.fn();
		// @ts-expect-error - taking a shortcut by accessing protected property
		simulatorClient.postFormattedRequest = postFormattedRequestStub;

		// @ts-expect-error - TypeScript fails to match type with data
		await simulatorClient[requestType](requestData);

		expect(postFormattedRequestStub).toHaveBeenCalledOnce();
		expect(postFormattedRequestStub.mock.calls[0][0]).toBe(requestType);
		expect(postFormattedRequestStub.mock.calls[0][1]).toBe(requestData);
	},
];

it(...callsPostFormattedRequestCorrectly(ClientRequestType.Ping, undefined));
it(...callsPostFormattedRequestCorrectly(ClientRequestType.SetSliceZone, []));
it(
	...callsPostFormattedRequestCorrectly(ClientRequestType.ScrollToSlice, {
		sliceIndex: 0,
	}),
);
