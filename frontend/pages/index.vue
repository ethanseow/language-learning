<template>
	<div class="px-16 py-10">
		<div class="flex flex-row items-center">
			<LogoText />
			<div class="grow"></div>
			<div class="flex flex-row gap-8 text-2xl font-semibold">
				<h1>FAQ</h1>
				<AuthWrapper>
					<template v-slot:unauth></template>
					<template v-slot:auth>
						<NuxtLink to="/dashboard"> Dashboard </NuxtLink>
					</template>
				</AuthWrapper>
				<AuthWrapper>
					<template v-slot:unauth>You are not logged in</template>
					<template v-slot:auth>You are logged in</template>
				</AuthWrapper>
			</div>
		</div>
		<div class="flex flex-row w-full mt-10 text-6xl items-center">
			<div>
				<div class="text-6xl font-bold text-secondary">
					Break down
					<br />
					language barriers.
				</div>
				<div class="mt-5 text-2xl font-semibold text-tertiary">
					Lorem ipsum dolor sit amet.
				</div>
			</div>
			<div class="grow"></div>
			<div class="w-1/3">
				<img src="/img/stock/voice-call.jpg" />
			</div>
		</div>
		<div class="mt-10 bg-secondary w-screen h-1/5 relative left-0"></div>
	</div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
