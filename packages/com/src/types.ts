import { SliceZone } from "@prismicio/types";

import { RequestMessage, ResponseMessage, Transaction } from "./channel";

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
	Resize = "resize",
}

export type APITransactions = {
	[APIRequestType.Resize]: Transaction<
		RequestMessage<APIRequestType.Resize, { height: number }>
	>;
};

export enum ClientRequestType {
	Ping = "ping",
	GetLibraries = "getLibraries",
	SetSliceZone = "setSliceZone",
	SetSliceZoneFromSliceIDs = "setSliceZoneFromSliceIDs",
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
};
