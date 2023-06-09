import { SliceZone } from "@prismicio/client";

import { RequestMessage, ResponseMessage, Transaction } from "./channel";

export type ActiveSlice = {
	rect: DOMRect;
	sliceID: string;
	variationID: string;
	index: number;
};

export type SliceZoneSize = {
	rect: DOMRect;
};

export enum APIRequestType {
	SetActiveSlice = "setActiveSlice",
	SetSliceZoneSize = "setSliceZoneSize",
}

export type APITransactions = {
	[APIRequestType.SetActiveSlice]: Transaction<
		RequestMessage<APIRequestType.SetActiveSlice, ActiveSlice | null>
	>;
	[APIRequestType.SetSliceZoneSize]: Transaction<
		RequestMessage<APIRequestType.SetSliceZoneSize, SliceZoneSize>
	>;
};

export enum ClientRequestType {
	Ping = "ping",
	SetSliceZone = "setSliceZone",
	ScrollToSlice = "scrollToSlice",
}

export type ClientTransactions = {
	[ClientRequestType.Ping]: Transaction<
		RequestMessage<ClientRequestType.Ping>,
		ResponseMessage<"pong">
	>;

	[ClientRequestType.SetSliceZone]: Transaction<
		RequestMessage<ClientRequestType.SetSliceZone, SliceZone>
	>;

	[ClientRequestType.ScrollToSlice]: Transaction<
		RequestMessage<
			ClientRequestType.ScrollToSlice,
			{
				sliceIndex: number;
				behavior?: "auto" | "smooth";
				block?: "start" | "center" | "end" | "nearest";
				inline?: "start" | "center" | "end" | "nearest";
			}
		>
	>;
};
