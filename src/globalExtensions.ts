import { SimulatorAPI } from "./SimulatorAPI";
import { SimulatorClient } from "./SimulatorClient";

declare global {
	interface Window {
		prismic?: {
			sliceSimulator?: {
				api?: SimulatorAPI[];
				client?: SimulatorClient[];
			};
		};
	}
}
