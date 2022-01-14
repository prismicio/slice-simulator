import { SliceZone } from "@prismicio/types";

import { RequestMessage, ResponseMessage, Transaction } from "./channel";

export type ActiveSlice = {
	rect: DOMRect;
	sliceID: string;
	variationID: string;
	index: number;
};

export type VariationSummary = {
	name: string;
	id: string;
};

export type SliceSummary = {
	name: string;
	id: string;
	variations: VariationSummary[];
};

export type LibrarySummary = {
	path: string;
	slices: SliceSummary[];
};

export enum APIRequestType {
	SetActiveSlice = "setActiveSlice",
}

export type APITransactions = {
	[APIRequestType.SetActiveSlice]: Transaction<
		RequestMessage<APIRequestType.SetActiveSlice, ActiveSlice | null>
	>;
};

export enum ClientRequestType {
	Ping = "ping",
	GetLibraries = "getLibraries",
	SetSliceZone = "setSliceZone",
	SetSliceZoneFromSliceIDs = "setSliceZoneFromSliceIDs",
	ScrollToSlice = "scrollToSlice",
}

export type ClientTransactions = {
	[ClientRequestType.Ping]: Transaction<
		RequestMessage<ClientRequestType.Ping>,
		ResponseMessage<"pong">
	>;

	[ClientRequestType.GetLibraries]: Transaction<
		RequestMessage<ClientRequestType.GetLibraries>,
		ResponseMessage<LibrarySummary[]>
	>;

	[ClientRequestType.SetSliceZone]: Transaction<
		RequestMessage<ClientRequestType.SetSliceZone, SliceZone>
	>;

	[ClientRequestType.SetSliceZoneFromSliceIDs]: Transaction<
		RequestMessage<
			ClientRequestType.SetSliceZoneFromSliceIDs,
			{ sliceID: string; variationID: string }[]
		>
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
