<template>
	<div class="relative" v-click-outside-no-blur="closeLangOptions">
		<LangChangeIcon
			@click="toggleLangOptions"
			class="w-8 h-8 bg-secondary"
		/>
		<div
			v-if="langOptions"
			class="absolute right-0 bg-secondary p-1 whitespace-nowrap"
		>
			<div v-for="l in availableLocales">
				<NuxtLink
					:key="l.code"
					:to="switchLocalePath(l.code)"
					@click.prevent.stop="setLocale(l.code)"
				>
					{{ l.name }}
				</NuxtLink>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const { locale, locales, getLocaleCookie, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const langOptions = ref(false);

const closeLangOptions = () => {
	langOptions.value = false;
};
const toggleLangOptions = () => {
	langOptions.value = !langOptions.value;
};
const availableLocales = computed(() => {
	// @ts-ignore
	return locales.value.filter((i) => i.code !== locale.value);
});
</script>

<style scoped></style>
