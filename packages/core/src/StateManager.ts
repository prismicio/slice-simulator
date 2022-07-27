import { SharedSlice, SliceZone } from "@prismicio/types";

import { ActiveSlice, LibrarySummary } from "@prismicio/slice-simulator-com";

import { EventEmitter } from "./lib/EventEmitter";
import { getDefaultManagedState, getDefaultSlices } from "./getDefault";
import {
	LibrariesStateLike,
	ManagedState,
	SliceSimulatorProps,
	StateManagerEvents,
	StateManagerEventType,
	StateManagerStatus,
} from "./types";
import { getActiveSliceDOM, getSliceZoneDOM } from "./domHelpers";
import { throttle } from "./lib/throttle";
import { __PRODUCTION__ } from "./lib/__PRODUCTION__";

export class StateManager extends EventEmitter<StateManagerEvents> {
	private _managedState: ManagedState;
	public set managedState(managedState: ManagedState) {
		this._managedState = managedState;
		this.emit(StateManagerEventType.ManagedState, managedState);
	}
	public get managedState(): ManagedState {
		return this._managedState;
	}

	private _slices: SliceZone;
	public set slices(slices: SliceZone) {
		this._slices = slices;
		// Clean up message
		this.message = "";
		// Dispatch event
		this.emit(StateManagerEventType.Slices, slices);
	}
	public get slices(): SliceZone {
		return this._slices;
	}

	private _activeSlice: ActiveSlice | null;
	public set activeSlice(activeSlice: ActiveSlice | null) {
		this._activeSlice = activeSlice;
		this.emit(StateManagerEventType.ActiveSlice, activeSlice);
	}
	public get activeSlice(): ActiveSlice | null {
		return this._activeSlice;
	}

	private _message: string;
	public set message(message: string) {
		this._message = message;
		this.emit(StateManagerEventType.Message, message);
	}
	public get message(): string {
		return this._message;
	}

	private _mouse: { x: number; y: number };

	constructor(
		managedState: ManagedState = getDefaultManagedState(),
		slices: SliceZone = getDefaultSlices(),
	) {
		super();

		this._managedState = managedState;
		this._slices = slices;
		this._activeSlice = null;
		this._message = "";

		// StateManager needs to keep track of mouse position for the active slice
		this._mouse = { x: 0, y: 0 };
	}

	async init(state: SliceSimulatorProps["state"]): Promise<void> {
		// Load state
		this._managedState = await this.load(state);

		if (__PRODUCTION__) {
			// Load all slice chunks at once to prevent any flickering in production
			await this.forceSliceChunksDownload();
		}

		this.setDefaultSliceZone();

		// Defering event to allow for chunks to load in background
		this.emit(StateManagerEventType.ManagedState, this._managedState);

		// Init listener
		window.addEventListener("mousemove", (event) => {
			this._mouse = { x: event.clientX, y: event.clientY };
		});
	}

	async load(state: SliceSimulatorProps["state"]): Promise<ManagedState> {
		try {
			const raw = await (typeof state === "function" ? state() : state);

			const res = LibrariesStateLike.decode(raw);

			if (res._tag === "Left") {
				console.error(res.left);

				throw new Error(
					"State does not validate expected format, see console logs for detailed report",
				);
			}

			return {
				data: res.right,
				status: StateManagerStatus.Loaded,
				error: null,
			};
		} catch (error) {
			console.error(error);

			return {
				data: null,
				status: StateManagerStatus.Error,
				error: error as Error,
			};
		}
	}

	async reload(state: SliceSimulatorProps["state"]): Promise<void> {
		this.managedState = await this.load(state);
		this.recoverSliceZone();
	}

	private _throwIfNotLoaded(
		methodName: string,
	): asserts this is { managedState: { data: LibrariesStateLike } } {
		if (this.managedState.status === StateManagerStatus.Error) {
			throw (
				this.managedState.error ??
				new Error("Unknown state error, see console logs for detailed report")
			);
		} else if (
			this.managedState.status === StateManagerStatus.Pending ||
			!this.managedState.data
		) {
			throw new Error(
				`\`StateManager.${methodName}()\` can only be called when the state is loaded, use \`StateManager.load()\` first`,
			);
		}
	}

	getLibraries(): LibrarySummary[] {
		this._throwIfNotLoaded("getLibraries");

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

	getMocks(): Record<string, Record<string, SharedSlice>> {
		this._throwIfNotLoaded("getMocks");

		return Object.values(this.managedState.data).reduce<
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
	}

	async forceSliceChunksDownload(): Promise<void> {
		// Download all slices chunks once
		this.setSliceZoneFromSliceIDs(
			this.getLibraries()
				.map((library) => {
					return library.slices.map((slice) => {
						return {
							sliceID: slice.id,
							variationID: slice.variations[0].id,
						};
					});
				})
				.flat(),
		);
		await new Promise((resolve) => setTimeout(resolve, 0));
		this.slices = [];
	}

	/**
	 * Set default SliceZone according to URL query parameters (lid, sid, vid)
	 */
	setDefaultSliceZone(): void {
		this._throwIfNotLoaded("setDefaultSliceZone");

		if (typeof window !== "undefined") {
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

	// Recover SliceZone if possible
	recoverSliceZone(): void {
		if (this._setSliceZoneFromSliceIDsLastCall) {
			this.setSliceZoneFromSliceIDs(this._setSliceZoneFromSliceIDsLastCall);
		}
	}

	private _setActiveSlice = (): void => {
		// There can't be an active slice if there's no slices displayed
		if (this.slices.length === 0) {
			this.activeSlice = null;

			return;
		}

		const $sliceZone = getSliceZoneDOM(this.slices.length);

		// SliceZone has not been found, therefore active slice cannot be found
		if (!$sliceZone) {
			this.activeSlice = null;

			return;
		}

		const $activeSlice = getActiveSliceDOM($sliceZone, this._mouse);

		// Active slice has not been found
		if (!$activeSlice) {
			this.activeSlice = null;

			return;
		}

		const activeSliceIndex = Array.prototype.indexOf.call(
			$sliceZone.children,
			$activeSlice,
		);

		// Active slice has been found
		this.activeSlice = {
			rect: $activeSlice.getBoundingClientRect(),
			sliceID: this.slices[activeSliceIndex].slice_type,
			variationID: (this.slices[activeSliceIndex] as SharedSlice).variation,
			index: activeSliceIndex,
		};
	};
	setActiveSlice = throttle(this._setActiveSlice, 16);

	setSliceZone(slices: SliceZone): void {
		// Wipe out the last call to setSliceZoneFromSliceIDs because slices cannot be recovered if setSliceZone was called last
		this._setSliceZoneFromSliceIDsLastCall = null;

		// Set slices
		this.slices = slices;
	}

	// Keep in memory last call to setSliceZoneFromSliceIDs to be able to recover slices
	private _setSliceZoneFromSliceIDsLastCall:
		| {
				sliceID: string;
				variationID: string;
		  }[]
		| null = null;
	setSliceZoneFromSliceIDs(
		slices: {
			sliceID: string;
			variationID: string;
		}[],
	): void {
		this._setSliceZoneFromSliceIDsLastCall = slices;

		const mocks = this.getMocks();

		this.slices = slices
			.map((slice) => {
				const sliceID = slice.sliceID;
				const variationID = slice.variationID;

				if (sliceID in mocks && variationID in mocks[sliceID]) {
					return mocks[sliceID][variationID];
				}
			})
			.filter(Boolean) as SliceZone;
	}
}
