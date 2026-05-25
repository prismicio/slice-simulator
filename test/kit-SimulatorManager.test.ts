import { expect, it, vi } from "vitest"

import { SimulatorAPI } from "../src/SimulatorAPI"
import type { UnknownRequestMessage } from "../src/channel"
import { createSuccessResponseMessage } from "../src/channel"
import { simulatorClass, simulatorRootClass } from "../src/kit/domHelpers"
import { sliceSimulatorAccessedDirectly } from "../src/kit/messages"
import { SimulatorManager } from "../src/kit/SimulatorManager"

const trustedOrigin = "https://foo.prismic.io"

it("initializes API when embedded", async () => {
	const manager = new SimulatorManager()

	const windowParentBck = window.parent
	// @ts-expect-error - deleting for test purpose
	delete window.parent
	const postMessageMock = vi.fn((request: UnknownRequestMessage) => {
		const response = createSuccessResponseMessage(request.requestID, undefined)
		// @ts-expect-error - taking a shortcut by accessing private properties
		manager._api._onPublicMessage({ data: response, origin: trustedOrigin })
	})
	window.parent = {
		postMessage: postMessageMock as Window["postMessage"],
	} as Window["parent"]

	try {
		await manager.init()

		expect(postMessageMock).toHaveBeenCalledOnce()
		// @ts-expect-error - taking a shortcut by accessing private property
		expect(manager._api).toBeInstanceOf(SimulatorAPI)
	} finally {
		window.parent = windowParentBck
	}
})

it("doesn't initialize API when not embedded and sets message", async () => {
	const manager = new SimulatorManager()

	await manager.init()

	// @ts-expect-error - taking a shortcut by accessing private property
	expect(manager._api).toBeNull()
	expect(manager.state.message).toBe(sliceSimulatorAccessedDirectly)
})

it("observes an existing simulator root when slice zone size API is enabled", () => {
	document.body.innerHTML = `<div class="${simulatorClass}">
		<div class="${simulatorRootClass}"></div>
	</div>`

	const observeMock = vi.fn()
	vi.stubGlobal(
		"ResizeObserver",
		vi.fn(function ResizeObserverMock() {
			return {
				disconnect: vi.fn(),
				observe: observeMock,
			}
		}),
	)

	try {
		const manager = new SimulatorManager()
		// @ts-expect-error - taking a shortcut by accessing private property
		manager._api = { options: { sliceZoneSizeAPI: true } }

		// @ts-expect-error - taking a shortcut by accessing private method
		manager._initListeners()

		expect(observeMock).toHaveBeenCalledWith(
			document.querySelector(`.${simulatorRootClass}`),
		)
	} finally {
		document.body.innerHTML = ""
		vi.unstubAllGlobals()
	}
})
