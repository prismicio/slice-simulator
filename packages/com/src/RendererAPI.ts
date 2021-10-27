import { ChannelReceiver } from "./lib";
import { MessageType, Messages } from "./types";

export class RendererAPI extends ChannelReceiver<Messages> {
	constructor(
		handlers: { [key in keyof Messages]?: (message: Messages[key]) => unknown },
		options?: { debug?: boolean },
	) {
		// TODO: Refactor for clarity maybe(?)
		const handleForeignMethod = <T extends Messages[keyof Messages]>(
			callback: (message: T, handler: (message: T) => unknown) => unknown,
		) => {
			return (message: T) => {
				const handler = handlers[message.type];
				if (!handler) {
					this.sendError(message.id, 501);
				} else {
					callback(message, handler as (message: T) => unknown);
				}
			};
		};

		// TODO: This needs to have a better interface
		super(
			{
				[MessageType.Ping]: (message) => {
					this.sendSuccess(message.id, 200, "pong");
				},
				[MessageType.GetLibraries]: handleForeignMethod((message, handler) => {
					this.sendSuccess(message.id, 200, handler(message));
				}),
				[MessageType.SetSlicesByID]: handleForeignMethod((message, handler) => {
					this.sendSuccess(message.id, 200, handler(message));
				}),
			},
			options,
		);
	}
}
