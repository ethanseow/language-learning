<template>
	<div
		class="bg-green-700 m-auto h-3/4 w-2/3 p-8 flex flex-col justify-center items-center gap-5 rounded-md"
	>
		<div class="font-bold text-3xl">🎉 Thanks For Signing Up 🎉</div>
		<div class="text-2xl">
			Your Practice Session will be on
			<span class="font-bold text-3xl">
				{{ getStringDateFormat(props.appointmentDate) }}
			</span>
		</div>
		<div class="text-center text-2xl">
			Offering:
			<LanguageText :language="languageOffering" />
		</div>
		<div class="text-center text-2xl">
			Seeking:
			<LanguageText :language="languageSeeking" />
		</div>
		<div class="text-4xl">See you Then!</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	appointmentDate: Date;
	languageOffering: string;
	languageSeeking: string;
}>();
</script>

<style scoped></style>
