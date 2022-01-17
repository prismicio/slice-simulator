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
		super(
			{
				[ClientRequestType.Ping]: (_req, res) => {
					return res.success("pong");
				},
				...requestHandlers,
			},
			{
				...simulatorAPIDefaultOptions,
				// True if `debug=true` is among query parameters
				debug: /[\?&]debug=true/i.test(
					decodeURIComponent(window.location.search),
				),
				...options,
			},
		);
	}

	[APIRequestType.SetActiveSlice]: TransactionMethod<
		APITransactions[APIRequestType.SetActiveSlice]
	> = async (data) => {
		return await this.postFormattedRequest(APIRequestType.SetActiveSlice, data);
	};
}
