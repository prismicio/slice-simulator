<template>
	<article class="slice-list">
		<h2 class="heading-h1 mb-6">{{ library.path }}</h2>
		<ul class="space-y-2">
			<li v-for="slice in library.slices" :key="slice.id">
				<slice-list-item :slice="slice" />
			</li>
		</ul>
	</article>
</template>

<script setup lang="ts">
import { LibrarySummary } from "@prismicio/slice-simulator-com";

import SliceListItem from "~/components/display/slice/ListItem.vue"

interface Props {
	library: LibrarySummary
};
defineProps<Props>();
</script>
