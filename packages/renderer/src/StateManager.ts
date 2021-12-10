import { SharedSlice, SliceZone } from "@prismicio/types";
import LibrariesState from "@slicemachine/core/build/src/models/LibrariesState";

import {
	ClientRequestType,
	LibrarySummary,
	RendererAPI,
} from "@prismicio/slice-canvas-com";

import {
	SliceCanvasProps,
	ManagedState,
	StateManagerStatus,
	StateManagerEvents,
	StateManagerEventType,
} from "./types";
import { getDefaultManagedState } from "./getDefaultManagedState";
import { EventEmitter } from "./lib/EventEmitter";
import { getDefaultSlices } from "./getDefaultSlices";

export class StateManager extends EventEmitter<StateManagerEvents> {
	public managedState: ManagedState;

	private _slices: SliceZone;
	protected set slices(slices: SliceZone) {
		this._slices = slices;
		this.emit(StateManagerEventType.Slices, slices);
	}

	private _api: RendererAPI | null;

	constructor(
		managedState: ManagedState = getDefaultManagedState(),
		slices: SliceZone = getDefaultSlices(),
	) {
		super();

		this.managedState = managedState;
		this._slices = slices;
		this._api = null;
	}

	async load(state: SliceCanvasProps["state"]): Promise<void> {
		try {
			const raw = await (typeof state === "function" ? state() : state);

			// TODO: Figure out why @slicemachine/core is broken
			const res =
				typeof LibrariesState !== "undefined" && false // TODO: Will use again once stabilized
					? LibrariesState.Libraries.decode(raw)
					: ({
							right: raw as LibrariesState.Libraries,
							_tag: "Right",
					  } as const);
			if (res._tag === "Left") {
				console.error(res.left);
				throw new Error(
					"State does not validate expected format, see trace above for detailed report",
				);
			}

			this.managedState = {
				data: res.right,
				status: StateManagerStatus.Loaded,
				error: null,
			};
			this.setDefaultSlices();
		} catch (error) {
			console.error(error);

			this.managedState = {
				data: null,
				status: StateManagerStatus.Error,
				error: error as Error,
			};
		}

		this.emit(StateManagerEventType.Loaded, this.managedState);

		await this.initAPI();
	}

	async initAPI(): Promise<void> {
		this._api = new RendererAPI({
			[ClientRequestType.GetLibraries]: (_req, res) => {
				return res.success(this.getLibraries());
			},
			[ClientRequestType.SetSliceZone]: (req, res) => {
				this.setSliceZone(req.data);

				return res.success();
			},
			[ClientRequestType.SetSliceZoneFromSliceIDs]: (req, res) => {
				this.setSliceZoneFromSliceIDs(req.data);

				return res.success();
			},
		});

		try {
			await this._api.ready();
		} catch (error) {
			console.error(error);
		}
	}

	setDefaultSlices(): void {
		// Set default slice to URL query params (lid, sid, vid)
		if (
			this.managedState.status === StateManagerStatus.Loaded &&
			typeof window !== "undefined"
		) {
			const url = new URL(window.location.href);

			if (url.searchParams.has("sid") && url.searchParams.has("vid")) {
				this.setSliceZoneFromSliceIDs([
					{
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						sliceID: url.searchParams.get("sid")!,
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						variationID: url.searchParams.get("vid")!,
					},
				]);
			}
		}
	}

	// COM API Handlers:

	// TODO: Temporary solution, should be refactored
	getLibraries(): LibrarySummary[] {
		if (
			this.managedState.status === StateManagerStatus.Pending ||
			!this.managedState.data
		) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		} else if (this.managedState.status === StateManagerStatus.Error) {
			throw new Error(
				"State is in error state, try troubleshooting above errors first",
			);
		}

		return Object.entries(this.managedState.data).map(
			([libraryPath, library]) => {
				const sliceMap = library.components;

				return {
					path: libraryPath,
					slices: Object.values(sliceMap).map((slice) => {
						return {
							id: slice.id,
							name: slice.name || slice.id,
							variations: slice.model.variations.map((variation) => {
								return {
									id: variation.id,
									name: variation.name || variation.id,
								};
							}),
						};
					}),
				};
			},
		);
	}

	setSliceZone(slices: SliceZone): void {
		this.slices = slices;
	}

	// TODO: Temporary solution, should be refactored
	setSliceZoneFromSliceIDs(
		slices: {
			sliceID: string;
			variationID: string;
		}[],
	): void {
		if (
			this.managedState.status !== StateManagerStatus.Loaded ||
			!this.managedState.data
		) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		}

		const allMocks = Object.values(this.managedState.data).reduce<
			Record<string, Record<string, SharedSlice>>
		>((acc, library) => {
			const sliceMap = library.components;

			Object.values(sliceMap).forEach((slice) => {
				acc[slice.id] = Object.values(slice.mocks).reduce<
					Record<string, SharedSlice>
				>((acc, mock) => {
					// TODO: Type definition from Slice Machine core is incomplete
					acc[mock.variation] = mock as unknown as SharedSlice;

					return acc;
				}, {});
			});

			return acc;
		}, {});

		this.slices = slices
			.map((slice) => {
				const sliceID = slice.sliceID;
				const variationID = slice.variationID;

				if (sliceID in allMocks && variationID in allMocks[sliceID]) {
					return allMocks[sliceID][variationID];
				}
			})
			.filter(Boolean) as SliceZone;
	}
}
