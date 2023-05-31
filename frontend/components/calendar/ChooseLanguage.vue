<template>
	<div>
		<label for="lang-offering">Offering : </label>
		<select
			name="lang-offering"
			:value="languageOffering"
			class="text-black"
			@change="(event : Event) => setLanguageOffering(event.target.value)"
		>
			<option v-for="lang in Languages" :value="lang">
				{{ lang }}
			</option>
		</select>
	</div>
	<div>
		<label for="lang-seeking">Seeking : </label>
		<select
			name="lang-seeking"
			:value="languageSeeking"
			@change="(event : Event) => setLanguageSeeking(event.target.value)"
			class="text-black"
		>
			<option v-for="lang in Languages" :value="lang">
				{{ lang }}
			</option>
		</select>
	</div>
</template>

<script setup lang="ts">
import { useTempLanguageStore } from "~~/stores/temp/language";
import { storeToRefs } from "pinia";
const languageChoice = useTempLanguageStore();
const { setLanguageOffering, setLanguageSeeking } = languageChoice;
const { languageOffering, languageSeeking } = storeToRefs(languageChoice);
</script>

<style scoped></style>
