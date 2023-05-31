<template>
	<div class="w-1/2 mx-auto text-center align-middle py-36">
		<h1 class="text-4xl font-semibold text-[#deaaff]">
			Frequently Asked Questions
		</h1>
	</div>
	<div class="flex flex-row w-2/3 mx-20">
		<div class="w-max">
			<h1 class="font-semibold text-2xl">General</h1>
		</div>
		<div class="grow"></div>
		<div class="flex flex-col w-1/2">
			<div v-for="q in generalQuestions" class="faq">
				<h1
					@click="handleToggle(q.id)"
					class="py-3 text-xl font-semibold border-t-2 border-white"
				>
					{{ q.header }}
				</h1>
				<p v-show="expanded.includes(q.id)">
					{{ q.answer }}
				</p>
			</div>
		</div>
	</div>

	<div class="flex flex-row w-2/3 mx-20 mt-16">
		<div class="w-max">
			<h1 class="font-semibold text-2xl">Pairing and Scheduling</h1>
		</div>
		<div class="grow"></div>
		<div class="flex flex-col w-1/2">
			<div v-for="q in pairingQuestions" class="faq">
				<h1
					@click="handleToggle(q.id)"
					class="py-3 text-xl font-semibold border-t-2 border-white"
				>
					{{ q.header }}
				</h1>
				<p v-show="expanded.includes(q.id)">
					{{ q.answer }}
				</p>
			</div>
		</div>
	</div>
	<div class="w-max mx-auto my-5 text-center">
		<h1 class="text-[#deaaff] mb-3 font-semibold text-xl">
			Any more questions?
		</h1>
		<button class="bg-purple-600 px-4 py-2 rounded-md">
			Send us an email
		</button>
	</div>
</template>

<script setup lang="ts">
import * as _ from "lodash";
import { Ref } from "vue";
const expanded: Ref<number[]> = ref([]);
const setExpanded = (newExpanded: any[]) => {
	//@ts-ignore
	expanded.value = _.cloneDeep(newExpanded);
};

const handleToggle = (id: number) => {
	if (expanded.value.includes(id)) {
		setExpanded(expanded.value.filter((x) => x !== id));
	} else {
		setExpanded([...expanded.value, id]);
	}
};

type Question = {
	id: number;
	header: string;
	answer: string;
};
const generalQuestions: Question[] = [
	{
		id: 1,
		header: "Lorem ipsum dolor sit amet.",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at ipsum a lorem placerat tempor. Nunc vestibulum bibendum dui at.",
	},
	{
		id: 2,
		header: "Lorem ipsum dolor sit amet.",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at ipsum a lorem placerat tempor. Nunc vestibulum bibendum dui at.",
	},
	{
		id: 3,
		header: "Lorem ipsum dolor sit amet.",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at ipsum a lorem placerat tempor. Nunc vestibulum bibendum dui at.",
	},
	{
		id: 4,
		header: "Lorem ipsum dolor sit amet.",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at ipsum a lorem placerat tempor. Nunc vestibulum bibendum dui at.",
	},
];

const pairingQuestions: Question[] = [
	{
		id: 5,
		header: "Lorem ipsum dolor sit amet.",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at ipsum a lorem placerat tempor. Nunc vestibulum bibendum dui at.",
	},
	{
		id: 6,
		header: "Lorem ipsum dolor sit amet.",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at ipsum a lorem placerat tempor. Nunc vestibulum bibendum dui at.",
	},
	{
		id: 7,
		header: "Lorem ipsum dolor sit amet.",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at ipsum a lorem placerat tempor. Nunc vestibulum bibendum dui at.",
	},
	{
		id: 8,
		header: "Lorem ipsum dolor sit amet.",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at ipsum a lorem placerat tempor. Nunc vestibulum bibendum dui at.",
	},
];
</script>

<style scoped>
.faq:last-child {
	border-bottom: 2px;
	border-color: white;
	border-style: solid;
}
</style>
