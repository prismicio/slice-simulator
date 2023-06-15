import {
	APIRequestType,
	APITransactions,
	ClientRequestType,
	ClientTransactions,
} from "./types";

import {
	AllChannelReceiverOptions,
	ChannelReceiver,
	TransactionMethod,
	TransactionsHandlers,
	TransactionsMethods,
} from "./channel";

export type SimulatorAPIOptions = {
	activeSliceAPI: boolean;
	sliceZoneSizeAPI: boolean;
};

export const simulatorAPIDefaultOptions: Partial<AllChannelReceiverOptions> &
	SimulatorAPIOptions = {
	requestIDPrefix: "api-",
	activeSliceAPI: false,
	sliceZoneSizeAPI: false,
};

export class SimulatorAPI
	extends ChannelReceiver<ClientTransactions, SimulatorAPIOptions>
	implements TransactionsMethods<APITransactions>
{
	constructor(
		requestHandlers: Omit<
			TransactionsHandlers<ClientTransactions>,
			ClientRequestType.Ping
		> &
			Partial<
				Pick<TransactionsHandlers<ClientTransactions>, ClientRequestType.Ping>
			>,
		options?: Partial<AllChannelReceiverOptions & SimulatorAPIOptions>,
	) {
		// True if `options.debug` is true or `debug=true` is among query parameters
		const debug =
			options?.debug ||
			/[?&]debug=true/i.test(decodeURIComponent(window.location.search));

		super(
			{
				[ClientRequestType.Ping]: (_req, res) => {
					return res.success("pong");
				},
				...requestHandlers,
			},
			{
				...simulatorAPIDefaultOptions,
				...options,
				debug,
			},
		);

		// Append API to window object
		if (debug) {
			window.prismic ||= {};
			window.prismic.sliceSimulator ||= {};
			window.prismic.sliceSimulator.api ||= [];
			window.prismic.sliceSimulator.api.push(this);
		}
	}

	[APIRequestType.SetActiveSlice]: TransactionMethod<
		APITransactions[APIRequestType.SetActiveSlice]
	> = async (data) => {
		return await this.postFormattedRequest(APIRequestType.SetActiveSlice, data);
	};

	[APIRequestType.SetSliceZoneSize]: TransactionMethod<
		APITransactions[APIRequestType.SetSliceZoneSize]
	> = async (data) => {
		return await this.postFormattedRequest(
			APIRequestType.SetSliceZoneSize,
			data,
		);
	};
}
