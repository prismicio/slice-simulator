import { SharedSlice, SliceZone } from "@prismicio/types";
import LibrariesState from "@slicemachine/core/build/src/models/LibrariesState";

import {
	ActiveSlice,
	ClientRequestType,
	LibrarySummary,
	RendererAPI,
	ResponseError,
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
import { sliceCanvasAccessedDirectly } from "./messages";
import { throttle } from "./lib/throttle";

export class StateManager extends EventEmitter<StateManagerEvents> {
	public managedState: ManagedState;

	private _slices: SliceZone;
	protected set slices(slices: SliceZone) {
		this._slices = slices;
		this.message = "";
		this.emit(StateManagerEventType.Slices, slices);
	}

	private _activeSlice: ActiveSlice | null;
	protected set activeSlice(activeSlice: ActiveSlice | null) {
		this._activeSlice = activeSlice;
		this.emit(StateManagerEventType.ActiveSlice, activeSlice);
	}

	private _message: string;
	protected set message(message: string) {
		this._message = message;
		this.emit(StateManagerEventType.Message, message);
	}

	private _api: RendererAPI | null;

	private _mouse: {
		x: number;
		y: number;
	};

	constructor(
		managedState: ManagedState = getDefaultManagedState(),
		slices: SliceZone = getDefaultSlices(),
	) {
		super();

		this.managedState = managedState;
		this._slices = slices;
		this._activeSlice = null;
		this._message = "";
		this._api = null;
		this._mouse = { x: 0, y: 0 };
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

			// Keep track of mouse position and find active slice
			window.addEventListener("mousemove", (event) => {
				this._mouse = { x: event.clientX, y: event.clientY };

				this.setActiveSlice();
			});

			// Listen to events that may alter displayed slices rendering
			window.addEventListener("resize", this.setActiveSlice.bind(this));
			window.addEventListener("mousewheel", () => {
				setTimeout(this.setActiveSlice.bind(this), 200);
			});
			this.on(StateManagerEventType.Slices, this.setActiveSlice.bind(this));
			this.on(StateManagerEventType.ActiveSlice, async (activeSlice) => {
				try {
					await this._api?.setActiveSlice(activeSlice);
				} catch (error) {
					// Just log bad requests, throw everything else
					if (error instanceof ResponseError && error.response.status === 400) {
						console.error(error.response);
					} else {
						throw error;
					}
				}
			});
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "Receiver is currently not embedded as an iframe" &&
				!this._slices.length
			) {
				this.message = sliceCanvasAccessedDirectly;
			}
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

	// TODO: Temporary solution, does not play well when there's a not found slice in production
	private _setActiveSlice(): void {
		// If there's no slices, abort
		if (this._slices.length === 0) {
			this.activeSlice = null;

			return;
		}

		// Get path starting from the SliceCanvasRenderer element
		const self =
			document.querySelector(".slice-canvas-renderer #root") ||
			document.querySelector(".slice-canvas-renderer");
		let path = document.elementsFromPoint(this._mouse.x, this._mouse.y);
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
			.slice(-6)
			.reverse(); // Keep only first 6 elements starting from `self`

		// Abort if no path is found
		if (!path.length) {
			this.activeSlice = null;

			return;
		}

		// Find the slice
		if (this._slices.length === 1) {
			// One slice case
			this.activeSlice = {
				rect: path[0].getBoundingClientRect(),
				sliceID: (this._slices[0] as SharedSlice).slice_type,
				variationID: (this._slices[0] as SharedSlice).variation,
				index: 0,
			};

			return;
		} else {
			// Multiple slices case
			for (let i = 0; i < path.length - 1; i++) {
				const $maybeSliceZone = path[i];

				// If element has the same amount of children as the slice zone has slices
				if ($maybeSliceZone.children.length === this._slices.length) {
					// Assume it's the slice zone and that next item is the hovered slice
					const $maybeSlice = path[i + 1];

					// Determine slice index in slice zone according ot the DOM
					const index = Array.from($maybeSliceZone.children).findIndex(
						($el) => $el === $maybeSlice,
					);

					if (index < 0 || index >= this._slices.length) {
						// If index is invalid
						this.activeSlice = null;
					} else {
						// Index is valid
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
