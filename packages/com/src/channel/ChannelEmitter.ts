import {
	ChannelNetwork,
	ChannelNetworkOptions,
	PostRequestOptions,
} from "./ChannelNetwork";
import {
	createSuccessResponseMessage,
	isRequestMessage,
	validateMessage,
} from "./message";
import { ConnectionTimeoutError, NotReadyError } from "./errors";
import {
	RequestMessage,
	ResponseMessage,
	SuccessResponseMessage,
	ExtractSuccessResponseMessage,
	UnknownRequestMessage,
	UnknownResponseMessage,
	TransactionsHandlers,
	UnknownTransaction,
	InternalEmitterRequestType,
	InternalReceiverRequestType,
} from "./types";

export type ChannelEmitterOptions = {
	connectionTimeout: number;
};

export const channelEmitterDefaultOptions: ChannelEmitterOptions &
	Partial<ChannelNetworkOptions> = {
	connectionTimeout: 20000,
	requestIDPrefix: "emitter-",
};

export type AllChannelEmitterOptions = ChannelEmitterOptions &
	ChannelNetworkOptions;

export abstract class ChannelEmitter<
	TReceiverTransactions extends Record<string, UnknownTransaction> = Record<
		string,
		never
	>,
> extends ChannelNetwork<ChannelEmitterOptions, TReceiverTransactions> {
	private _target: HTMLIFrameElement;
	private _channel: MessageChannel | null = null;
	protected get channel(): MessageChannel {
		if (!this._channel) {
			throw new Error("Channel is not set");
		}

		return this._channel;
	}
	protected set channel(channel: MessageChannel) {
		this._channel = channel;
	}
	private _connected = false;

	constructor(
		target: HTMLIFrameElement,
		requestHandlers: TransactionsHandlers<TReceiverTransactions>,
		options: Partial<AllChannelEmitterOptions>,
	) {
		super(requestHandlers, { ...channelEmitterDefaultOptions, ...options });

		this._target = target;
	}

	connect(reconnect = false): Promise<SuccessResponseMessage> {
		this.channel = new MessageChannel();
		this.port = this.channel.port1;

		return new Promise<SuccessResponseMessage>((resolve, reject) => {
			// Wait for target to be loaded
			this._target.addEventListener(
				"load",
				() => {
					// Throw if target doesn't allow access to content window
					if (!this._target.contentWindow) {
						throw new Error("Target window is not available");
					}

					const readyTimeout = setTimeout(() => {
						reject(new ConnectionTimeoutError());
					}, this.options.connectionTimeout);

					// Connect to target once ready
					const onReadyConnect = async (
						event?: MessageEvent<unknown>,
					): Promise<void> => {
						if (this.options.debug && event) {
							// eslint-disable-next-line no-console
							console.debug(event.data);
						}

						let maybeReadyResponse: SuccessResponseMessage | null = null;

						// If not reconnecting...
						if (!reconnect) {
							if (!event || event.source !== this._target.contentWindow) {
								// ...return if no event or event is not from target...
								return;
							} else {
								// ...otherwise, return if not valid or ready message
								try {
									const message = validateMessage(event.data);

									if (
										!isRequestMessage(message) ||
										message.type !== InternalReceiverRequestType.Ready
									) {
										return;
									} else {
										maybeReadyResponse = createSuccessResponseMessage(
											message.requestID,
											undefined,
										);
									}
								} catch (error) {
									if (error instanceof TypeError) {
									} else {
										throw error;
									}
								}
							}
						}

						// Clear ready timeout
						clearTimeout(readyTimeout);

						// Conclude handshake by sending message channel port to target
						const request = this.createRequestMessage(
							InternalEmitterRequestType.Connect,
							undefined,
						);

						// Send port
						const response = await this.postRequest<
							RequestMessage<InternalEmitterRequestType.Connect>,
							ResponseMessage
						>(request, (request) => {
							// Target content window is checked in previous statement
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							this._target.contentWindow!.postMessage(request, "*", [
								this.channel.port2,
							]);
						});

						// Answer ready message if neceassary
						if (maybeReadyResponse) {
							this.postResponse(maybeReadyResponse);
						}

						this._connected = true;

						if (!reconnect) {
							window.addEventListener("message", onReadyConnect.bind(this));
						}

						resolve(response);
					};

					if (reconnect) {
						// Target is assumed already ready upon reconnection
						onReadyConnect();
					} else {
						// Listen for target to be ready
						window.addEventListener("message", onReadyConnect.bind(this));
					}
				},
				{ once: true },
			);
		});
	}

	protected postFormattedRequest<
		TRequest extends UnknownRequestMessage,
		TResponse extends UnknownResponseMessage,
	>(
		type: TRequest["type"],
		data?: TRequest["data"],
		options: PostRequestOptions = {},
	): Promise<ExtractSuccessResponseMessage<TResponse>> {
		if (!this._connected) {
			throw new NotReadyError(
				"Sender is not connected, use `ChannelSender.connect()` first",
			);
		}

		return this.postRequest(
			this.createRequestMessage(type, data),
			undefined,
			options,
		);
	}
}
