import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isRequestMessage,
	isSuccessResponseMessage,
	validateMessage,
} from "./message";
import {
	PortNotSetError,
	RequestTimeoutError,
	TooManyConcurrentRequestsError,
} from "./errors";
import {
	RequestMessage,
	ExtractSuccessResponseMessage,
	TransactionsHandlers,
	UnknownRequestMessage,
	UnknownResponseMessage,
	UnknownTransaction,
} from "./types";

export type PostRequestOptions = {
	timeout?: number;
};

export type ChannelNetworkOptions = {
	debug: boolean;
	maximumRequestConcurrency: number;
	defaultTimeout: number;
	requestIDPrefix: string;
};

export const channelNetworkDefaultOptions: ChannelNetworkOptions = {
	debug: false,
	maximumRequestConcurrency: 20,
	defaultTimeout: 5000,
	requestIDPrefix: "channel-",
};

export abstract class ChannelNetwork<
	TOptions extends Record<string, unknown> = Record<string, never>,
	TPartnerTransactions extends Record<string, UnknownTransaction> = Record<
		string,
		never
	>,
> {
	public requestHandlers: TransactionsHandlers<TPartnerTransactions>;
	public options: ChannelNetworkOptions & TOptions;

	private _port: MessagePort | null = null;
	protected get port(): MessagePort {
		if (!this._port) {
			throw new PortNotSetError();
		}

		return this._port;
	}
	protected set port(port: MessagePort) {
		// Destroy old port
		if (this._port) {
			this._port.onmessage = null;
		}

		this._port = port;
		this.port.onmessage = this.onMessage.bind(this);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _pendingRequests: Map<string, (response: any) => void> = new Map();

	constructor(
		requestHandlers: TransactionsHandlers<TPartnerTransactions>,
		options: Partial<ChannelNetworkOptions> & TOptions,
	) {
		this.requestHandlers = requestHandlers;
		this.options = { ...channelNetworkDefaultOptions, ...options };
	}

	public createRequestMessage<TType extends string = string, TData = undefined>(
		type: TType,
		data: TData,
	): RequestMessage<TType, TData> {
		return createRequestMessage(type, data, this.options.requestIDPrefix);
	}

	private async onMessage(event: MessageEvent<unknown>): Promise<void> {
		if (this.options.debug) {
			// eslint-disable-next-line no-console
			console.debug(event.data);
		}

		try {
			const message = validateMessage(event.data);

			if (isRequestMessage(message)) {
				if (!this.requestHandlers[message.type]) {
					this.postResponse(
						createErrorResponseMessage(message.requestID, undefined, 400),
					);
				} else {
					try {
						const response = await this.requestHandlers[message.type](message, {
							success: createSuccessResponseMessage.bind(
								this,
								message.requestID,
							),
							error: createErrorResponseMessage.bind(this, message.requestID),
						});

						this.postResponse(response);
					} catch (error) {
						this.postResponse(
							createErrorResponseMessage(message.requestID, error, 500),
						);
					}
				}
			} else {
				if (!this._pendingRequests.has(message.requestID)) {
					console.error(
						`Unknown request ID received in response: ${JSON.stringify(
							message,
						)}`,
					);
				} else {
					// Pending requests are checked in previous statement
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					this._pendingRequests.get(message.requestID)!(message);
					this._pendingRequests.delete(message.requestID);
				}
			}
		} catch (error) {
			if (error instanceof TypeError) {
				return console.warn(error.message);
			} else {
				throw error;
			}
		}
	}

	protected postRequest<
		TRequest extends UnknownRequestMessage,
		TResponse extends UnknownResponseMessage,
	>(
		request: TRequest,
		postMessage = (request: TRequest): void => this.port.postMessage(request),
		options: PostRequestOptions = {},
	): Promise<ExtractSuccessResponseMessage<TResponse>> {
		if (this._pendingRequests.size >= this.options.maximumRequestConcurrency) {
			throw new TooManyConcurrentRequestsError(request);
		}

		return new Promise<ExtractSuccessResponseMessage<TResponse>>(
			(resolve, reject) => {
				const requestTimeout = setTimeout(() => {
					if (this._pendingRequests.has(request.requestID)) {
						reject(new RequestTimeoutError(request));
						this._pendingRequests.delete(request.requestID);
					}
				}, options.timeout || this.options.defaultTimeout);

				this._pendingRequests.set(
					request.requestID,
					(response: TResponse): void => {
						clearTimeout(requestTimeout);

						isSuccessResponseMessage(response)
							? resolve(response as ExtractSuccessResponseMessage<TResponse>)
							: reject(response);
					},
				);

				postMessage(request);
			},
		);
	}

	protected postResponse<TResponse extends UnknownResponseMessage>(
		response: TResponse,
		postMessage = (response: TResponse): void =>
			this.port.postMessage(response),
	): TResponse {
		postMessage(response);

		return response;
	}
}
