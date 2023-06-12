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
const a = ref();
</script>

<template>
	<div class="text-black">
		<form>
			<label>Type</label>
			<input id="" v-model="a" />
		</form>
	</div>
</template>
