import type { SimulatorAPI } from "./SimulatorAPI"
import type { SimulatorClient } from "./SimulatorClient"

declare global {
	interface Window {
		prismic?: {
			sliceSimulator?: {
				api?: SimulatorAPI[]
				client?: SimulatorClient[]
			}
		}
	}
}
