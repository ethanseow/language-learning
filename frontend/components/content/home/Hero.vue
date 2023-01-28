<template>
	<div class="hero-grid">
		<div class="title bg-yellow-300">
			<div>Explore a 14 day free trial</div>
			<div class="text-[100px]">Financial Tracking Platform</div>
		</div>
		<div class="image bg-red-500"></div>
		<div class="footnote bg-blue-600 py-[20px]"></div>
		<div class="details bg-green-500"></div>
	</div>
</template>

<script setup lang="ts"></script>
<style scoped>
.hero-grid {
	padding: 2rem 5rem;
	display: grid;
	grid-template-columns: 40% 1fr;
	grid-template-rows: 1fr 1fr 1fr;
	grid-template-areas:
		"desc-title desc-image"
		"desc-title desc-image"
		"desc-footnote desc-details";
	gap: 10px;
}
.title {
	grid-area: desc-title;
}
.image {
	grid-area: desc-image;
}
.footnote {
	grid-area: desc-footnote;
}
.details {
	grid-area: desc-details;
}
</style>
