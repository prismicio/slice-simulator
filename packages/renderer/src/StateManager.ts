import { SharedSlice, SliceZone } from "@prismicio/types";
import LibrariesState from "@slicemachine/core/build/src/models/LibrariesState";

import { EventEmitter } from "./lib/EventEmitter";
import {
	SliceCanvasProps,
	LibrarySummary,
	ActiveSlice,
	ManagedState,
	StateManagerStatus,
	StateManagerEventType,
	StateManagerEvents,
} from "./types";
import { getDefaultManagedState } from "./getDefaultManagedState";
import { getDefaultSlices } from "./getDefaultSlices";
import { getDefaultActiveSlice } from "./getDefaultActiveSlice";
import { throttle } from "./lib/throttle";

export class StateManager extends EventEmitter<StateManagerEvents> {
	public managedState: ManagedState;

	private _slices: SliceZone;
	protected set slices(slices: SliceZone) {
		this._slices = slices;
		this.emit(StateManagerEventType.Slices, slices);
	}

	private _activeSlice: ActiveSlice | null;
	protected set activeSlice(activeSlice: ActiveSlice | null) {
		this._activeSlice = activeSlice;
		this.emit(StateManagerEventType.ActiveSlice, activeSlice);
	}

	constructor(
		managedState: ManagedState = getDefaultManagedState(),
		slices: SliceZone = getDefaultSlices(),
		activeSlice = getDefaultActiveSlice(),
	) {
		super();

		this.managedState = managedState;
		this._slices = slices;
		this._activeSlice = activeSlice;
	}

	async load(state: SliceCanvasProps["state"]): Promise<void> {
		try {
			const raw = await (typeof state === "function" ? state() : state);

			const res = LibrariesState.Libraries.decode(raw);
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
			this.managedState.status !== StateManagerStatus.Loaded ||
			!this.managedState.data
		) {
			throw new Error("State is not loaded, use `StateManager.load()` first");
		}

		return Object.entries(this.managedState.data).map(
			([libraryPath, slices]) => {
				return {
					path: libraryPath,
					slices: Object.values(slices).map((slice) => {
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

	public getActiveSlice(): ActiveSlice | null {
		return this._activeSlice;
	}

	private _setActiveSlice({ x, y }: { x: number; y: number }): void {
		// If there's no slices, abort
		if (this._slices.length === 0) {
			this.activeSlice = null;

			return;
		}

		// Get part of event path starting from the SliceCanvasRenderer element
		const self =
			document.querySelector(".slice-canvas-renderer #root") ||
			document.querySelector(".slice-canvas-renderer");
		let path = document.elementsFromPoint(x, y);
		path = path
			.slice(
				0,
				Math.min(
					path.length,
					Math.max(
						path.findIndex((el) => el === self),
						0,
					),
				),
			)
			.slice(-6); // Keep only 6 last elements

		// Abort if no path is found
		if (!path.length) {
			this.activeSlice = null;

			return;
		}

		// Find the slice
		if (this._slices.length === 1) {
			// One slice case
			this.activeSlice = {
				rect: path[path.length - 1].getBoundingClientRect(),
				sliceID: (this._slices[0] as SharedSlice).slice_type,
				variationID: (this._slices[0] as SharedSlice).variation,
				index: 0,
			};

			return;
		} else {
			// Multiple slices case
			for (let i = path.length - 1; i >= 1; i--) {
				const $maybeSliceZone = path[i];

				if ($maybeSliceZone.children.length === this._slices.length) {
					const $maybeSlice = path[i - 1];

					const index = Array.from($maybeSliceZone.children).findIndex(
						($el) => $el === $maybeSlice,
					);

					if (index < 0 || index >= this._slices.length) {
						this.activeSlice = null;
					} else {
						this.activeSlice = {
							rect: $maybeSlice.getBoundingClientRect(),
							sliceID: (this._slices[index] as SharedSlice).slice_type,
							variationID: (this._slices[index] as SharedSlice).variation,
							index,
						};
					}

					return;
				}
			}
		}
	}
	setActiveSlice = throttle(this._setActiveSlice, 16);

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
		>((acc, sliceMap) => {
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
