import { it, expect, vi } from "vitest";

import { createRequestMessage } from "../src/channel";
import {
	APIRequestType,
	ClientRequestType,
	ClientTransactions,
	SimulatorClient,
} from "../src";

const iframe = document.createElement("iframe");

it("instantiates correctly", () => {
	expect(
		() =>
			new SimulatorClient(iframe, {
				[APIRequestType.SetActiveSlice]: (_req, res) => {
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

	type ClientWindow = typeof window & {
		prismic?: { sliceSimulator: { client: SimulatorClient[] } };
	};

	expect((window as ClientWindow).prismic?.sliceSimulator.client[0]).toBe(
		simulatorClient,
	);

	delete (window as ClientWindow).prismic;
});

const callsPostFormattedRequestCorrectly = <
	TRequestType extends ClientRequestType,
>(
	requestType: TRequestType,
	requestData: ClientTransactions[TRequestType]["request"]["data"],
): [string, () => Promise<void>] => [
	`\`SimulatorClient.${requestType}()\` calls \`postFormattedRequest\` correctly`,
	async () => {
		const simulatorClient = new SimulatorClient(iframe);

		const postFormattedRequestStub = vi.fn();
		// @ts-expect-error - taking a shortcut by accessing protected property
		simulatorClient.postFormattedRequest = postFormattedRequestStub;

		// @ts-expect-error - cannot provide "void" type generically
		await simulatorClient[requestType](requestData);

		expect(postFormattedRequestStub).toHaveBeenCalledOnce();
		// @ts-expect-error - type is broken
		expect(postFormattedRequestStub.calls[0][0]).toBe(requestType);
		// @ts-expect-error - type is broken
		expect(postFormattedRequestStub.calls[0][1]).toBe(requestData);
	},
];

/* eslint-disable prettier/prettier */

it(...callsPostFormattedRequestCorrectly(ClientRequestType.Ping, undefined));
it(...callsPostFormattedRequestCorrectly(ClientRequestType.GetLibraries, undefined));
it(...callsPostFormattedRequestCorrectly(ClientRequestType.SetSliceZone, []));
it(...callsPostFormattedRequestCorrectly(ClientRequestType.SetSliceZoneFromSliceIDs, []));
it(...callsPostFormattedRequestCorrectly(ClientRequestType.ScrollToSlice, { sliceIndex: 0}));

/* eslint-enable prettier/prettier */
