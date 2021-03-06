import {
	AllChannelReceiverOptions,
	ChannelReceiver,
	TransactionMethod,
	TransactionsHandlers,
	TransactionsMethods,
} from "./channel";
import {
	APIRequestType,
	APITransactions,
	ClientRequestType,
	ClientTransactions,
} from "./types";

export const simulatorAPIDefaultOptions: Partial<AllChannelReceiverOptions> = {
	requestIDPrefix: "api-",
};

export class SimulatorAPI
	extends ChannelReceiver<ClientTransactions>
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
		options?: Partial<AllChannelReceiverOptions>,
	) {
		// True if `options.debug` is true or `debug=true` is among query parameters
		const debug =
			options?.debug ||
			/[\?&]debug=true/i.test(decodeURIComponent(window.location.search));

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

		// Append api to window object
		if (debug) {
			type APIWindow = typeof window & {
				prismic: { sliceSimulator?: { api?: SimulatorAPI[] } };
			};

			(window as APIWindow).prismic ||= {};
			(window as APIWindow).prismic.sliceSimulator ||= {};
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			(window as APIWindow).prismic.sliceSimulator!.api ||= [];
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			(window as APIWindow).prismic.sliceSimulator!.api!.push(this);
		}
	}

	[APIRequestType.SetActiveSlice]: TransactionMethod<
		APITransactions[APIRequestType.SetActiveSlice]
	> = async (data) => {
		return await this.postFormattedRequest(APIRequestType.SetActiveSlice, data);
	};
}
