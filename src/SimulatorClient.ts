import type {
	APITransactions,
	ClientTransactions} from "./types";
import {
	APIRequestType,
	ClientRequestType
} from "./types"

import type { SimulatorAPIOptions } from "./SimulatorAPI"
import type {
	AllChannelEmitterOptions,
	TransactionMethod,
	TransactionsHandlers,
	TransactionsMethods} from "./channel";
import {
	ChannelEmitter
} from "./channel"

export const simulatorClientDefaultOptions: Partial<AllChannelEmitterOptions> =
	{
		requestIDPrefix: "client-",
	}

export class SimulatorClient
	extends ChannelEmitter<
		APITransactions,
		Partial<AllChannelEmitterOptions>,
		SimulatorAPIOptions
	>
	implements TransactionsMethods<ClientTransactions>
{
	constructor(
		target: HTMLIFrameElement,
		requestHandlers?: Partial<TransactionsHandlers<APITransactions>>,
		options?: Partial<AllChannelEmitterOptions>,
	) {
		// True if `options.debug` is true or `debug=true` is among query parameters
		const debug =
			options?.debug ||
			/[?&]debug=true/i.test(decodeURIComponent(window.location.search))

		super(
			target,
			{
				[APIRequestType.SetActiveSlice]: (_req, res) => {
					return res.success()
				},
				[APIRequestType.SetSliceZoneSize]: (_req, res) => {
					return res.success()
				},
				...requestHandlers,
			},
			{
				...simulatorClientDefaultOptions,
				...options,
				debug,
			},
		)

		// Append client to window object
		if (debug) {
			window.prismic ||= {}
			window.prismic.sliceSimulator ||= {}
			window.prismic.sliceSimulator.client ||= []
			window.prismic.sliceSimulator.client.push(this)
		}
	}

	[ClientRequestType.Ping]: TransactionMethod<
		ClientTransactions[ClientRequestType.Ping]
	> = async () => {
		return await this.postFormattedRequest(ClientRequestType.Ping)
	};

	[ClientRequestType.SetSliceZone]: TransactionMethod<
		ClientTransactions[ClientRequestType.SetSliceZone]
	> = async (data) => {
		return await this.postFormattedRequest(ClientRequestType.SetSliceZone, data)
	};

	[ClientRequestType.ScrollToSlice]: TransactionMethod<
		ClientTransactions[ClientRequestType.ScrollToSlice]
	> = async (data) => {
		return await this.postFormattedRequest(
			ClientRequestType.ScrollToSlice,
			data,
		)
	}
}
