import { expect, it, vi } from "vitest"

import type {
	APITransactions} from "../src";
import {
	APIRequestType,
	ClientRequestType,
	SimulatorAPI,
} from "../src"
import { createRequestMessage } from "../src/channel"

it("instantiates correctly", () => {
	expect(
		() =>
			new SimulatorAPI({
				[ClientRequestType.Ping]: (_req, res) => {
					return res.success("pong")
				},
				[ClientRequestType.SetSliceZone]: (_req, res) => {
					return res.success()
				},
				[ClientRequestType.ScrollToSlice]: (_req, res) => {
					return res.success()
				},
			}),
	).not.toThrowError()
})

it("instantiates correctly with defaults", () => {
	const simulatorAPI = new SimulatorAPI({
		[ClientRequestType.SetSliceZone]: (_req, res) => {
			return res.success()
		},
		[ClientRequestType.ScrollToSlice]: (_req, res) => {
			return res.success()
		},
	})

	const [req, res] = [
		createRequestMessage(ClientRequestType.Ping, undefined),
		{
			success: vi.fn(),
			error: vi.fn(),
		},
	]

	simulatorAPI.requestHandlers[ClientRequestType.Ping](req, res)

	expect(res.success).toHaveBeenCalledOnce()
	expect(res.error).not.toHaveBeenCalled()
})

it("registers instance on window object", () => {
	expect("prismic" in window).toBe(false)

	const simulatorClient = new SimulatorAPI(
		{
			[ClientRequestType.SetSliceZone]: (_req, res) => {
				return res.success()
			},
			[ClientRequestType.ScrollToSlice]: (_req, res) => {
				return res.success()
			},
		},
		{ debug: true },
	)

	expect(window?.prismic?.sliceSimulator?.api?.[0]).toBe(simulatorClient)

	delete window.prismic
})

const callsPostFormattedRequestCorrectly = <
	TRequestType extends APIRequestType,
	TRequestData extends APITransactions[TRequestType]["request"]["data"],
>(
	requestType: TRequestType,
	requestData: TRequestData,
): [string, () => Promise<void>] => [
	`\`SimulatorAPI.${requestType}()\` calls \`postFormattedRequest\` correctly`,
	async () => {
		const simulatorAPI = new SimulatorAPI({
			[ClientRequestType.SetSliceZone]: (_req, res) => {
				return res.success()
			},
			[ClientRequestType.ScrollToSlice]: (_req, res) => {
				return res.success()
			},
		})

		const postFormattedRequestStub = vi.fn()
		// @ts-expect-error - taking a shortcut by accessing protected property
		simulatorAPI.postFormattedRequest = postFormattedRequestStub

		// @ts-expect-error - TypeScript fails to match type with data
		await simulatorAPI[requestType](requestData)

		expect(postFormattedRequestStub).toHaveBeenCalledOnce()
		expect(postFormattedRequestStub.mock.calls[0][0]).toBe(requestType)
		expect(postFormattedRequestStub.mock.calls[0][1]).toBe(requestData)
	},
]

it(...callsPostFormattedRequestCorrectly(APIRequestType.SetActiveSlice, null))
it(
	...callsPostFormattedRequestCorrectly(APIRequestType.SetSliceZoneSize, {
		rect: {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			toJSON: () => "",
		},
	}),
)
