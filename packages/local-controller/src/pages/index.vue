<template>
	<with-sidebar class="__page__index">
		<template #sidebar>
			<slice-list v-if="rendererState.libraries" :library="rendererState.libraries[0]" />
		</template>
		<slice-iframe :src="src" />
	</with-sidebar>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { state as rendererState } from "~/store/renderer";

import WithSidebar from '~/components/layouts/WithSidebar.vue';
import SliceList from "~/components/display/slice/List.vue";
import SliceIframe from "~/components/controls/slice/Iframe.vue";

const src = ref("http://localhost:3000/slice-canvas");

defineExpose({ rendererState, src });
</script>
