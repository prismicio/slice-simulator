import { SliceZone } from "@prismicio/types";

import { ActiveSlice, LibrarySummary } from "@prismicio/slice-canvas-renderer";

import { RequestMessage, ResponseMessage, Transaction } from "./channel";

export enum APIRequestType {}

export type APITransactions = Record<string, never>;

export enum ClientRequestType {
	Ping = "ping",
	GetLibraries = "getLibraries",
	GetActiveSlice = "getActiveSlice",
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

	[ClientRequestType.GetActiveSlice]: Transaction<
		RequestMessage<ClientRequestType.GetActiveSlice, { x: number; y: number }>,
		ResponseMessage<ActiveSlice | null>
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
