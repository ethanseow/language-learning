<template>
	<div class="relative">
		<LangChangeIcon
			@click="toggleLangOptions"
			class="w-8 h-8 bg-secondary"
		/>
		<div
			v-if="langOptions"
			class="absolute right-0 bg-secondary p-1 whitespace-nowrap"
		>
			<NuxtLink
				v-for="locale in availableLocales"
				:key="locale.code"
				:to="switchLocalePath(locale.code)"
				@click.prevent.stop="setLocale(locale.code)"
			>
				{{ languages[locale.name] }}
			</NuxtLink>
		</div>
	</div>
</template>

<script setup lang="ts">
const { locale, locales, getLocaleCookie, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const langOptions = ref(false);
const toggleLangOptions = () => {
	langOptions.value = !langOptions.value;
};
const languages: any = {
	English: "English",
	Mandarin: "简体中文",
};

const availableLocales = computed(() => {
	// @ts-ignore
	return locales.value.filter((i) => i.code !== locale.value);
});
</script>

<style scoped></style>
