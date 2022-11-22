import {
	ClientRequestType,
	ResponseError,
	SimulatorAPI,
} from "@prismicio/slice-simulator-com";
import { SliceZone } from "@prismicio/types";

import { getDefaultManagedState, getDefaultSlices } from "./getDefault";
import { getSliceZoneDOM } from "./domHelpers";
import { sliceSimulatorAccessedDirectly } from "./messages";
import { StateManager } from "./StateManager";
import {
	ManagedState,
	SliceSimulatorProps,
	StateManagerEventType,
} from "./types";

export class CoreManager {
	public stateManager: StateManager;
	private _api: SimulatorAPI | null;
	private _initialized: boolean;

	constructor(
		managedState: ManagedState = getDefaultManagedState(),
		slices: SliceZone = getDefaultSlices(),
	) {
		this.stateManager = new StateManager(managedState, slices);
		this._api = null;
		this._initialized = false;
	}

	async init(state: SliceSimulatorProps["state"]) {
		// When not handling HMR, init might be called multiple times, here we take a shortcut by just reloading the state on subsequent inits
		if (this._initialized) {
			await this.stateManager.reload(state);

			return;
		} else {
			this._initialized = true;
		}

		// Init state manager
		await this.stateManager.init(state);

		// Init COM API
		try {
			await this._initAPI();
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "Receiver is currently not embedded as an iframe" &&
				!this.stateManager.slices.length
			) {
				// Catch not embedded error and display message
				this.stateManager.message = sliceSimulatorAccessedDirectly;
			}
			console.error(error);

			return;
		}

		// Init listeners
		this._initListeners();
	}

	private async _initAPI(): Promise<void> {
		// Register SimulatorAPI request handlers
		this._api = new SimulatorAPI({
			[ClientRequestType.GetLibraries]: (_req, res) => {
				return res.success(this.stateManager.getLibraries());
			},
			[ClientRequestType.SetSliceZone]: (req, res) => {
				this.stateManager.setSliceZone(req.data);

				return res.success();
			},
			[ClientRequestType.SetSliceZoneFromSliceIDs]: (req, res) => {
				this.stateManager.setSliceZoneFromSliceIDs(req.data);

				return res.success();
			},
			[ClientRequestType.ScrollToSlice]: (req, res) => {
				// Error if `sliceIndex` is invalid
				if (req.data.sliceIndex < 0) {
					return res.error("`sliceIndex` must be > 0", 400);
				} else if (req.data.sliceIndex >= this.stateManager.slices.length) {
					return res.error(
						`\`sliceIndex\` must be < ${this.stateManager.slices.length} (\`<SliceZone />\` current length)`,
						400,
					);
				}

				const $sliceZone = getSliceZoneDOM(this.stateManager.slices.length);
				if (!$sliceZone) {
					return res.error("Failed to find `<SliceZone />`", 500);
				}

				// Destroy existing active slice as we're about to scroll
				this.stateManager.activeSlice = null;

				const $slice = $sliceZone.children[req.data.sliceIndex];
				if (!$slice) {
					return res.error(
						`Failed fo find slice at index $\`{req.data.sliceIndex}\` in \`<SliceZone />\``,
						500,
					);
				}

				// Scroll to Slice
				$slice.scrollIntoView({
					behavior: req.data.behavior,
					block: req.data.block,
					inline: req.data.inline,
				});

				// Update active slice after scrolling
				this._api?.options.activeSliceAPI &&
					setTimeout(this.stateManager.setActiveSlice, 750);

				return res.success();
			},
		});

		// Mark API as ready
		await this._api.ready();
	}

	private _initListeners(): void {
		// Update active slice on mouse move
		window.addEventListener("mousemove", () => {
			this._api?.options.activeSliceAPI && this.stateManager.setActiveSlice();
		});
		// Update active slice on events impacting slices rendering
		window.addEventListener("resize", () => {
			this._api?.options.activeSliceAPI && this.stateManager.setActiveSlice();
		});
		window.addEventListener("mousewheel", () => {
			this._api?.options.activeSliceAPI &&
				setTimeout(this.stateManager.setActiveSlice, 200);
		});

		// Update active slice when slices are set
		this.stateManager.on(StateManagerEventType.Slices, () => {
			this._api?.options.activeSliceAPI && this.stateManager.setActiveSlice();
		});
		// Send active slices to renderer
		this.stateManager.on(
			StateManagerEventType.ActiveSlice,
			async (activeSlice) => {
				if (this._api) {
					try {
						await this._api.setActiveSlice(activeSlice);
					} catch (error) {
						// Just log bad requests, throw everything else
						if (
							error instanceof ResponseError &&
							error.response.status === 400
						) {
							console.error(error.response);
						} else {
							throw error;
						}
					}
				}
			},
		);
	}
}
