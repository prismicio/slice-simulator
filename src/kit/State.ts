import type { SharedSlice, SliceZone } from "@prismicio/client";

import { EventEmitter } from "../lib/EventEmitter";
import { __PRODUCTION__ } from "../lib/__PRODUCTION__";
import { throttle } from "../lib/throttle";

import type { ActiveSlice } from "../types";
import { StateEventType, StateEvents } from "./types";

import { getActiveSliceDOM, getSliceZoneDOM } from "./domHelpers";
import { getDefaultSlices } from "./getDefault";

type StateConstructorArgs = {
	slices?: SliceZone;
};

export class State extends EventEmitter<StateEvents> {
	private _slices: SliceZone;
	public set slices(slices: SliceZone) {
		this._slices = slices;
		// Clean up message
		this.message = "";
		// Dispatch event
		this.emit(StateEventType.Slices, slices);
	}
	public get slices(): SliceZone {
		return this._slices;
	}

	private _activeSlice: ActiveSlice | null;
	public set activeSlice(activeSlice: ActiveSlice | null) {
		this._activeSlice = activeSlice;
		this.emit(StateEventType.ActiveSlice, activeSlice);
	}
	public get activeSlice(): ActiveSlice | null {
		return this._activeSlice;
	}

	private _message: string;
	public set message(message: string) {
		this._message = message;
		this.emit(StateEventType.Message, message);
	}
	public get message(): string {
		return this._message;
	}

	private _mouse: { x: number; y: number };

	constructor(args?: StateConstructorArgs) {
		super();

		this._slices = args?.slices || getDefaultSlices();
		this._activeSlice = null;
		this._message = "";

		// StateManager needs to keep track of mouse position for the active slice
		this._mouse = { x: 0, y: 0 };
	}

	async init(): Promise<void> {
		// Init listener
		window.addEventListener("mousemove", (event) => {
			this._mouse = { x: event.clientX, y: event.clientY };
		});
	}

	private _setActiveSlice = (): void => {
		// There can't be an active slice if there's no slice displayed
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
		// Set slices
		this.slices = slices;
	}
}
