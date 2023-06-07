import {
	ExtractErrorResponseMessage,
	ExtractSuccessResponseMessage,
	RequestMessage,
	TransactionsHandlers,
	UnknownRequestMessage,
	UnknownResponseMessage,
	UnknownTransaction,
} from "./types";

import {
	PortNotSetError,
	RequestTimeoutError,
	ResponseError,
	TooManyConcurrentRequestsError,
} from "./errors";

import {
	createErrorResponseMessage,
	createRequestMessage,
	createSuccessResponseMessage,
	isRequestMessage,
	isSuccessResponseMessage,
	validateMessage,
} from "./messages";

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
	TPartnerTransactions extends Record<string, UnknownTransaction> = Record<
		string,
		never
	>,
	TOptions extends Record<string, unknown> = Record<string, unknown>,
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
	protected set port(port: MessagePort | null) {
		// Destroy old port
		if (this._port) {
			this._port.onmessage = null;
		}

		this._port = port;
		if (this._port) {
			this._port.onmessage = this.onMessage.bind(this);
		}
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

	protected async onMessage(event: MessageEvent<unknown>): Promise<void> {
		if (this.options.debug) {
			// eslint-disable-next-line no-console
			console.debug(event.data);
		}

		try {
			const message = validateMessage(event.data);

			if (isRequestMessage(message)) {
				if (!this.requestHandlers[message.type]) {
					this.postResponse(
						createErrorResponseMessage(message.requestID, undefined, 501),
					);
				} else {
					try {
						// TODO: Figure out why type cannot be inferred on its own anymore
						const response = await this.requestHandlers[message.type](message, {
							success: createSuccessResponseMessage.bind(
								this,
								message.requestID,
							) as Parameters<
								(typeof this.requestHandlers)[string]
							>[1]["success"],
							error: createErrorResponseMessage.bind(
								this,
								message.requestID,
							) as Parameters<
								(typeof this.requestHandlers)[string]
							>[1]["error"],
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
				console.warn(error.message);
			} else {
				// Should not be possible, but who knows :shrug:
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
		if (this.options.debug) {
			// eslint-disable-next-line no-console
			console.debug(request);
		}

		if (this._pendingRequests.size >= this.options.maximumRequestConcurrency) {
			throw new TooManyConcurrentRequestsError(request);
		}

		return new Promise<ExtractSuccessResponseMessage<TResponse>>(
			(resolve, reject) => {
				const requestTimeout = setTimeout(() => {
					if (this._pendingRequests.has(request.requestID)) {
						this._pendingRequests.delete(request.requestID);
					}
					reject(new RequestTimeoutError(request));
				}, options.timeout || this.options.defaultTimeout);

				this._pendingRequests.set(
					request.requestID,
					(response: TResponse): void => {
						clearTimeout(requestTimeout);

						isSuccessResponseMessage(response)
							? resolve(response as ExtractSuccessResponseMessage<TResponse>)
							: reject(
									new ResponseError(
										response as ExtractErrorResponseMessage<TResponse>,
									),
							  );
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
		if (this.options.debug) {
			// eslint-disable-next-line no-console
			console.debug(response);
		}

		postMessage(response);

		return response;
	}
}
