<template>
	<div class="flex flex-row justify-between">
		<div class="w-1/3">
			<span class="font-semibold text-2xl"> Past Sessions </span>
			<div class="w-full h-[2px] bg-white my-3"></div>
			<Sessions v-for="session in pastSessions" v-bind="session" />
		</div>
		<div class="w-1/3">
			<span class="font-semibold text-2xl"> Upcoming Sessions </span>
			<div class="w-full h-[2px] bg-white my-3"></div>
			<Sessions v-for="session in upcomingSessions" v-bind="session" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
const { upcomingSessions, pastSessions } = storeToRefs(useSessionStore());
</script>
