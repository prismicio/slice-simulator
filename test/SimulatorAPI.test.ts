import { expect, it, vi } from "vitest";

import {
	APIRequestType,
	APITransactions,
	ClientRequestType,
	SimulatorAPI,
} from "../src";
import { createRequestMessage } from "../src/channel";

it("instantiates correctly", () => {
	expect(
		() =>
			new SimulatorAPI({
				[ClientRequestType.Ping]: (_req, res) => {
					return res.success("pong");
				},
				[ClientRequestType.GetLibraries]: (_req, res) => {
					return res.success([]);
				},
				[ClientRequestType.SetSliceZone]: (_req, res) => {
					return res.success();
				},
				[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
					return res.success();
				},
				[ClientRequestType.ScrollToSlice]: (_req, res) => {
					return res.success();
				},
			}),
	).not.toThrowError();
});

it("instantiates correctly with defaults", () => {
	const simulatorAPI = new SimulatorAPI({
		[ClientRequestType.GetLibraries]: (_req, res) => {
			return res.success([]);
		},
		[ClientRequestType.SetSliceZone]: (_req, res) => {
			return res.success();
		},
		[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
			return res.success();
		},
		[ClientRequestType.ScrollToSlice]: (_req, res) => {
			return res.success();
		},
	});

	const [req, res] = [
		createRequestMessage(ClientRequestType.Ping, undefined),
		{
			success: vi.fn(),
			error: vi.fn(),
		},
	];

	simulatorAPI.requestHandlers[ClientRequestType.Ping](req, res);

	expect(res.success).toHaveBeenCalledOnce();
	expect(res.error).not.toHaveBeenCalled();
});

it("registers instance on window object", () => {
	expect("prismic" in window).toBe(false);

	const simulatorClient = new SimulatorAPI(
		{
			[ClientRequestType.GetLibraries]: (_req, res) => {
				return res.success([]);
			},
			[ClientRequestType.SetSliceZone]: (_req, res) => {
				return res.success();
			},
			[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
				return res.success();
			},
			[ClientRequestType.ScrollToSlice]: (_req, res) => {
				return res.success();
			},
		},
		{ debug: true },
	);

	type APIWindow = typeof window & {
		prismic?: { sliceSimulator: { api: SimulatorAPI[] } };
	};

	expect((window as APIWindow).prismic?.sliceSimulator.api[0]).toBe(
		simulatorClient,
	);

	delete (window as APIWindow).prismic;
});

const callsPostFormattedRequestCorrectly = <
	TRequestType extends APIRequestType,
>(
	requestType: TRequestType,
	requestData: APITransactions[TRequestType]["request"]["data"],
): [string, () => Promise<void>] => [
	`\`SimulatorAPI.${requestType}()\` calls \`postFormattedRequest\` correctly`,
	async () => {
		const simulatorAPI = new SimulatorAPI({
			[ClientRequestType.GetLibraries]: (_req, res) => {
				return res.success([]);
			},
			[ClientRequestType.SetSliceZone]: (_req, res) => {
				return res.success();
			},
			[ClientRequestType.SetSliceZoneFromSliceIDs]: (_req, res) => {
				return res.success();
			},
			[ClientRequestType.ScrollToSlice]: (_req, res) => {
				return res.success();
			},
		});

		const postFormattedRequestStub = vi.fn();
		// @ts-expect-error - taking a shortcut by accessing protected property
		simulatorAPI.postFormattedRequest = postFormattedRequestStub;

		await simulatorAPI[requestType](requestData);

		expect(postFormattedRequestStub).toHaveBeenCalledOnce();
		expect(postFormattedRequestStub.mock.calls[0][0]).toBe(requestType);
		expect(postFormattedRequestStub.mock.calls[0][1]).toBe(requestData);
	},
];

/* eslint-disable prettier/prettier */

it(...callsPostFormattedRequestCorrectly(APIRequestType.SetActiveSlice, null));

/* eslint-enable prettier/prettier */
