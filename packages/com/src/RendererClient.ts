import { LibrarySummary } from "@prismicio/slice-canvas-renderer";

import { ChannelSender } from "./lib";
import { Messages, MessageType, SuccessResponse } from "./types";

export class RendererClient extends ChannelSender<Messages> {
	constructor(
		target: HTMLIFrameElement,
		options?: { debug?: boolean; timeout?: number },
	) {
		super(target, options);
	}

	// TODO: Return type should be inferred from Messages
	async ping(): Promise<SuccessResponse<undefined>> {
		return await this.postMessage(MessageType.Ping);
	}

	async getLibraries(): Promise<SuccessResponse<LibrarySummary[]>> {
		return await this.postMessage(MessageType.GetLibraries);
	}

	async setSlicesByID(
		data: Messages[MessageType.SetSlicesByID]["data"],
	): Promise<SuccessResponse> {
		return await this.postMessage(MessageType.SetSlicesByID, data);
	}
}
