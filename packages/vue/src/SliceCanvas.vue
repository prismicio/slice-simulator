<template>
	<div class="slice-canvas">
		Hello World Vue
		<slicecanvasHub />
		{{ state.status }}
		{{ { currentRoute } }}
	</div>
</template>

<script>
import { State, createRouter } from "@prismicio/slicecanvas-client";
import "@prismicio/slicecanvas-client/dist/css/style.min.css";

import { slicecanvasHub } from "./components";

export default {
	components: {
		slicecanvasHub
	},
	props: {
		statePredicate: {
			type: Function,
			default: () => import("~~/.slicemachine/slicecanvas-state.json"),
		},
	},
	data() {
		return {
			state: State.getDefault(),
			currentRoute: null,
			router: createRouter(),
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		init() {
			this.router.watch((currentRoute) => {
				this.currentRoute = currentRoute;
			});
			State.load(this.statePredicate, (state) => {
				this.state = state;
			});
		}
	}
}
</script>
