import { SliceZone } from "@prismicio/types";

import { LibrarySummary } from "@prismicio/slice-canvas-renderer";

import { RequestMessage, ResponseMessage, Transaction } from "./channel";

export enum APIRequestType {}

export type APITransactions = Record<string, never>;

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
