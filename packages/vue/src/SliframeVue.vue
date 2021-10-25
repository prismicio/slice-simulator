<template>
	<div class="sliframe">
		Hello World Vue
		<SliframeHub />
		{{ state.status }}
		{{ { currentRoute } }}
	</div>
</template>

<script>
import { State, createRouter } from "@prismicio/sliframe-core";
import "@prismicio/sliframe-core/dist/css/style.min.css";

import { SliframeHub } from "./components";

export default {
	components: {
		SliframeHub
	},
	props: {
		statePredicate: {
			type: Function,
			default: () => import("~~/.slicemachine/sliframe-state.json"),
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
