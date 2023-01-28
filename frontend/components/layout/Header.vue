<template>
	<div class="flex flex-row w-full items-center px-24 py-10 gap-10">
		<LogoText />
		<div class="flex flex-row grow gap-10 justify-evenly">
			<NuxtLink :to="urlConsts.WAITROOM" class="font-semibold text-2xl"
				>Lobby</NuxtLink
			>
			<NuxtLink :to="urlConsts.FEATURES" class="font-semibold text-2xl"
				>Features</NuxtLink
			>
			<NuxtLink :to="urlConsts.ABOUT" class="font-semibold text-2xl"
				>How It Works</NuxtLink
			>
		</div>
		<JoinNow />
		<Hamburger class="w-[40px] h-[40px]" />
	</div>
	<div class="flex flex-row justify-center">
		<div class="w-[95%] h-[1.5px] bg-black"></div>
	</div>
</template>

<script setup lang="ts"></script>
