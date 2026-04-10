import type { SliceZone } from "@prismicio/client"
import { expect, it, vi } from "vitest"

import { State } from "../src/kit/State"
import { StateEventType } from "../src/kit/types"

const slices = [{ slice_type: "foo" }] as unknown as SliceZone

const withEmbeddedWindowParent = async (callback: () => void | Promise<void>): Promise<void> => {
	const windowParentBck = window.parent
	// @ts-expect-error - deleting for test purpose
	delete window.parent
	window.parent = {} as Window["parent"]

	try {
		await callback()
	} finally {
		window.parent = windowParentBck
	}
}

it("emits slices events when embedded", () =>
	withEmbeddedWindowParent(() => {
		const state = new State()
		const onSlices = vi.fn()

		state.on(StateEventType.Slices, onSlices)
		state.slices = slices

		expect(onSlices).toHaveBeenCalledOnce()
		expect(onSlices).toHaveBeenCalledWith(slices)
	}))

it("emits empty slices events when not embedded", () => {
	const state = new State()
	const onSlices = vi.fn()

	state.on(StateEventType.Slices, onSlices)
	state.slices = slices

	expect(onSlices).toHaveBeenCalledOnce()
	expect(onSlices).toHaveBeenCalledWith([])
})

it("allows reading slices when embedded", () =>
	withEmbeddedWindowParent(() => {
		const state = new State({ slices })

		expect(state.slices).toBe(slices)
	}))

it("doesn't allow reading slices when not embedded", () => {
	const state = new State({ slices })

	expect(state.slices).toStrictEqual([])
})
