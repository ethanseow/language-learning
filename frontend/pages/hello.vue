<script setup lang="ts">
const { locale, locales, getLocaleCookie, setLocale } = useI18n();

const availableLocales = computed(() => {
	// @ts-ignore
	return locales.value.filter((i) => i.code !== locale.value);
});
watch(locale, () => {
	console.log("locale changed", locale.value);
});
onMounted(() => {
	console.log(getLocaleCookie());
	// it is not being set here
	console.log(locale.value);
});
</script>

<template>
	<div>
		<a
			href="#"
			v-for="locale in availableLocales"
			:key="locale.code"
			@click.prevent.stop="setLocale(locale.code)"
			>{{ locale.name }}</a
		>
	</div>
	<div>
		{{ $t("welcome") }}
	</div>
</template>
