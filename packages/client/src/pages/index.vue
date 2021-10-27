<template>
	<with-sidebar class="__page__index">
		<template #sidebar>
			<slice-list v-if="rendererState.libraries" :library="rendererState.libraries[0]" />
		</template>
		<slice-iframe :slice="current.slice" :variation="current.variation" />
	</with-sidebar>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { state as rendererState } from "~/store/renderer";

import WithSidebar from '~/components/layouts/WithSidebar.vue';
import SliceList from "~/components/display/slice/List.vue"
import SliceIframe from "~/components/display/slice/Iframe.vue"

const current = ref({
	slice: {
		name: "SimpleHero",
		id: "simple-hero",
	},
	variation: {
		name: "With a House",
		id: "with-a-house"
	}
});

defineExpose({ rendererState, current });
</script>
