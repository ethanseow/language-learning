<template>
	<div
		class="flex flex-row w-full px-16 mt-5 text-6xl items-center md:flex-col-reverse"
	>
		<div>
			<div class="text-6xl font-bold text-secondary md:mt-2">
				Break down
				<br />
				language barriers.
			</div>
			<div class="mt-5 text-2xl font-semibold text-tertiary md:hidden">
				Lorem ipsum dolor sit amet.
				<br />
				Lorem ipsum dolor sit amet
				<br />
				consectetur adipisicing <br />
				elit. Rerum, modi?
			</div>
		</div>
		<div class="grow"></div>
		<div class="min-w-[300px] w-1/3 md:w-2/3">
			<img src="/img/stock/voice-call.jpg" />
		</div>
	</div>
	<div
		class="text-5xl font-semibold items-center mt-10 text-center mx-auto w-1/2"
	>
		<div class="border-b-white border-b-[0px] text-gray-400">
			Lorem ipsum dolor sit amet consectetur
		</div>
		<h1 class="text-xl font-normal md:hidden">
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam
			temporibus vel officia quam velit saepe. Lorem ipsum dolor sit amet.
		</h1>
	</div>
	<div class="w-max mx-auto my-5">
		<button class="bg-[#c77dff] px-6 py-3">Explore the platform</button>
	</div>
	<div class="bg-[#dee2e6] w-full py-10 text-center">
		<h1 class="text-[#343a40] py-5 font-bold text-4xl text-color">
			What is language exchange?
		</h1>
		<p class="text-[#6c757d] font-semibold">
			Lorem ipsum dolor sit amet.
			<span class="text-black">Lorem, ipsum.</span>
		</p>
		<img class="mx-auto mt-5 w-1/2" src="/img/stock/live-usage.jpg" />
		<p class="w-1/2 mt-5 mx-auto text-black">
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta
			placeat velit ad. Assumenda quod eos omnis amet ex id quasi!
		</p>
	</div>
	<h1 class="mx-auto w-max mt-10 font-bold text-white text-5xl">
		How does it work?
	</h1>
	<div
		class="justify-center grid grid-cols-3 grid-rows-[1fr_max-content] grid-flow-col gap-4 w-5/6 h-1/3 mx-auto mt-10 mb-10 md:grid-flow-row md:grid-cols-2 md:grid-rows-3"
	>
		<img class="how-to-img" src="/img/stock/calendar.jpg" />
		<div>
			<h1 class="font-bold text-2xl mt-4">Lorem ipsum dolor sit.</h1>
			<h2 class="font-medium">
				Lorem ipsum dolor sit amet consectetur adipisicing elit.
			</h2>
		</div>
		<img class="how-to-img" src="/img/stock/select-language.jpg" />
		<div>
			<h1 class="font-bold text-2xl mt-4">Lorem ipsum dolor sit.</h1>
			<h2 class="font-medium">
				Lorem ipsum dolor sit amet consectetur adipisicing elit.
			</h2>
		</div>
		<img class="how-to-img" src="/img/stock/started-voice-call.jpg" />
		<div>
			<h1 class="font-bold text-2xl mt-4">Lorem ipsum dolor sit.</h1>
			<h2 class="font-medium">
				Lorem ipsum dolor sit amet consectetur adipisicing elit.
			</h2>
		</div>
	</div>
</template>

<script setup lang="ts">
const css =
	"grow justify-center items-center text-center flex flex-col gap-4 lg:flex-row lg:text-start";
</script>
<style scoped>
.how-to-large {
	display: flex;
	flex-direction: row;
}
.how-to-xl {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.how-to-img {
	height: 100%;
	width: 100%;
}
</style>
