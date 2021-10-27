import { ErrorResponse, Message, SuccessResponse } from "../types";

export enum DefaultMessageType {
	Connect = "connect",
}

export type DefaultMessages = {
	[DefaultMessageType.Connect]: Message<DefaultMessageType.Connect>;
};

let id = 0;

export abstract class ChannelSender<
	TMessages extends Record<string | number | symbol, Message> = Record<
		string,
		never
	>,
> {
	public static validateResponse(
		response: SuccessResponse | ErrorResponse,
	): void {
		if (
			!Object.keys(response).every((key) =>
				["messageID", "status", "msg", "data", "error"].includes(key),
			)
		) {
			throw new Error(`Unknown response received: ${JSON.stringify(response)}`);
		} else if ("data" in response && "error" in response) {
			throw new Error(`Invalid response received: ${JSON.stringify(response)}`);
		}
	}

	private _target: HTMLIFrameElement;
	private _channel: MessageChannel;
	private _connected = false;
	private _pendingMessages: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: number]: (data: SuccessResponse<any> | ErrorResponse<any>) => void;
	} = {};
	public options: { debug: boolean; timeout: number } = {
		debug: false,
		timeout: 5000,
	};

	constructor(
		target: HTMLIFrameElement,
		options?: { debug?: boolean; timeout?: number },
	) {
		this._target = target;
		this._channel = new MessageChannel();
		this.options = { ...this.options, ...options };

		this._channel.port1.onmessage = this._onMessage.bind(this);
	}

	/**
	 * Connect to the target.
	 */
	async connect(): Promise<SuccessResponse> {
		if (!this._target.contentWindow) {
			throw new Error("Target window is not available");
		}

		const response = await this.postMessage(
			DefaultMessageType.Connect,
			undefined,
			(message) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this._target.contentWindow!.postMessage(message, "*", [
					this._channel.port2,
				]);
			},
		);

		this._connected = true;

		return response;
	}

	/**
	 * Send a message through the channel.
	 */
	protected async postMessage<T>(
		type: keyof (TMessages & DefaultMessages),
		data: (TMessages & DefaultMessages)[keyof (TMessages &
			DefaultMessages)]["data"] = undefined,
		postMessage = (message: Message): void =>
			this._channel.port1.postMessage(message),
	): Promise<SuccessResponse<T>> {
		if (!this._connected && type !== DefaultMessageType.Connect) {
			throw new Error(
				"ChannelSender is not connected, use `ChannelSender.connect()` first",
			);
		}

		return new Promise((resolve, reject) => {
			const message = {
				id: id++,
				type,
				data,
			};

			// Reject after timeout has ellapsed
			const timeout = setTimeout(() => {
				if (this._pendingMessages[message.id]) {
					reject(new Error("Timeout"));
					delete this._pendingMessages[message.id];
				}
			}, this.options.timeout);

			// Register the response handler
			this._pendingMessages[message.id] = (
				response: SuccessResponse<T> | ErrorResponse,
			): void => {
				clearTimeout(timeout);
				"error" in response ? reject(response) : resolve(response);
			};

			// Post message
			postMessage(message);
		});
	}

	/**
	 * Listen to messages from the target and dispatch them.
	 */
	private _onMessage(event: MessageEvent<SuccessResponse | ErrorResponse>) {
		const response = event.data;

		if (this.options.debug) {
			// eslint-disable-next-line no-console
			console.debug(response);
		}

		try {
			ChannelSender.validateResponse(response);
		} catch (error) {
			return console.warn((error as Error).message);
		}

		if (!this._pendingMessages[response.messageID]) {
			console.error(
				`Unknown response ID received: ${JSON.stringify(response)}`,
			);
		} else {
			this._pendingMessages[response.messageID](response);
			delete this._pendingMessages[response.messageID];
		}
	}
}
