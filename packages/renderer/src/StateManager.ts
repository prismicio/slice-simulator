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
				typeof LibrariesState !== "undefined"
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
		// TODO: Temporary solution to mimic Storybook iframe interface
		if (
			this.managedState.status === StateManagerStatus.Loaded &&
			typeof window !== "undefined" &&
			window.location.hash.startsWith("#/iframe.html")
		) {
			const query = decodeURIComponent(
				window.location.hash.replace(/^#\/iframe.html\?/i, ""),
			)
				.split("&")
				.reduce<Record<string, string>>((acc, current) => {
					const [key, value] = current.split("=");

					return { ...acc, [key]: value };
				}, {});

			if ("id" in query) {
				const [sliceID, variationID] = query.id
					.replace(/^slices-/, "")
					.split("--");

				this.setSliceZoneFromSliceIDs([{ sliceID, variationID }], true);
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
		loose = false, // TODO: Temporary solution to mimic Storybook iframe interface
	): void {
		if (
			this.managedState.status !== StateManagerStatus.Loaded ||
			!this.managedState.data
		) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		}

		const keyed = (str: string) =>
			loose ? str.toLowerCase().replace(/[-_]/g, "") : str;

		const allMocks = Object.values(this.managedState.data).reduce<
			Record<string, Record<string, SharedSlice>>
		>((acc, library) => {
			const sliceMap = library.components;

			Object.values(sliceMap).forEach((slice) => {
				acc[keyed(slice.id)] = Object.values(slice.mocks).reduce<
					Record<string, SharedSlice>
				>((acc, mock) => {
					// TODO: Type definition from Slice Machine core is incomplete
					acc[keyed(mock.variation)] = mock as unknown as SharedSlice;

					return acc;
				}, {});
			});

			return acc;
		}, {});

		this.slices = slices
			.map((slice) => {
				const sliceID = keyed(slice.sliceID);
				const variationID = keyed(slice.variationID);

				if (sliceID in allMocks && variationID in allMocks[sliceID]) {
					return allMocks[sliceID][variationID];
				}
			})
			.filter(Boolean) as SliceZone;
	}
}
