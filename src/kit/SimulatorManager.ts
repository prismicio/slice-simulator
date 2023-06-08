import type { SliceZone } from "@prismicio/client";

import { throttle } from "../lib/throttle";

import { ClientRequestType } from "../types";
import { StateEventType } from "./types";

import { SimulatorAPI } from "../SimulatorAPI";
import { ResponseError } from "../channel";

import { State } from "./State";
import {
	getSimulatorDOM,
	getSimulatorRootDOM,
	getSliceZoneDOM,
} from "./domHelpers";
import { sliceSimulatorAccessedDirectly } from "./messages";

type ManagerConstructorArgs = {
	slices?: SliceZone;
};

export class SimulatorManager {
	public state: State;
	private _api: SimulatorAPI | null;
	private _initialized: boolean;

	constructor(args?: ManagerConstructorArgs) {
		this.state = new State(args);
		this._api = null;
		this._initialized = false;
	}

	async init(): Promise<void> {
		if (this._initialized) {
			return;
		} else {
			this._initialized = true;
		}

		// Init state manager
		await this.state.init();

		// Init API
		try {
			await this._initAPI();
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "Receiver is currently not embedded as an iframe" &&
				!this.state.slices.length
			) {
				// Catch not embedded error and display message
				this.state.message = sliceSimulatorAccessedDirectly;
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
			[ClientRequestType.SetSliceZone]: (req, res) => {
				this.state.setSliceZone(req.data);

				return res.success();
			},
			[ClientRequestType.ScrollToSlice]: (req, res) => {
				// Error if `sliceIndex` is invalid
				if (req.data.sliceIndex < 0) {
					return res.error("`sliceIndex` must be > 0", 400);
				} else if (req.data.sliceIndex >= this.state.slices.length) {
					return res.error(
						`\`sliceIndex\` must be < ${this.state.slices.length} (\`<SliceZone />\` current length)`,
						400,
					);
				}

				const $sliceZone = getSliceZoneDOM(this.state.slices.length);
				if (!$sliceZone) {
					return res.error("Failed to find `<SliceZone />`", 500);
				}

				// Destroy existing active slice as we're about to scroll
				this.state.activeSlice = null;

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
					setTimeout(this.state.setActiveSlice, 750);

				return res.success();
			},
		});

		// Mark API as ready
		await this._api.ready();
	}

	private _initListeners(): void {
		if (this._api?.options.activeSliceAPI) {
			// Update active slice on mouse move
			window.addEventListener("mousemove", () => {
				this.state.setActiveSlice();
			});
			// Update active slice on events impacting slices rendering
			window.addEventListener("resize", () => {
				this.state.setActiveSlice();
			});
			window.addEventListener("mousewheel", () => {
				setTimeout(this.state.setActiveSlice, 200);
			});

			// Update active slice when slices are set
			this.state.on(StateEventType.Slices, () => {
				this.state.setActiveSlice();
			});
			// Send active slices to renderer
			this.state.on(StateEventType.ActiveSlice, async (activeSlice) => {
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
			});
		}

		if (this._api?.options.sliceZoneSizeAPI) {
			// Monitor Simulator root node size
			const resizeObserver = new ResizeObserver(
				throttle(async (entries) => {
					const [entry] = entries;

					if (this._api && entry) {
						try {
							await this._api.setSliceZoneSize({ rect: entry.contentRect });
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
				}, 16),
			);
			const observeSimulatorRoot = () => {
				const simulatorRootDOM = getSimulatorRootDOM();
				resizeObserver.disconnect();
				if (simulatorRootDOM) {
					resizeObserver.observe(simulatorRootDOM);
				}
			};

			// Monitor Simulator root node in DOM
			const mutationObserver = new MutationObserver(observeSimulatorRoot);
			// We want it to fail if not found
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			mutationObserver.observe(getSimulatorDOM()!, {
				subtree: false,
				childList: true,
			});
		}
	}
}
