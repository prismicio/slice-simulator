<template>
	<with-sidebar class="__page__index">
		<template #sidebar>
			<slice-list v-if="simulatorState.libraries" :library="simulatorState.libraries[0]" />
		</template>
		<slice-iframe :src="src" />
	</with-sidebar>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { state as simulatorState } from "~/store/simulator";

import WithSidebar from '~/components/layouts/WithSidebar.vue';
import SliceList from "~/components/display/slice/List.vue";
import SliceIframe from "~/components/controls/slice/Iframe.vue";

const src = ref("http://localhost:3000/slice-simulator");
// const src = ref("http://localhost:3000/slice-simulator?debug=true");

defineExpose({ simulatorState, src });
</script>
