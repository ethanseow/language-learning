<template>
	<div
		class="fixed top-0 left-0 w-full h-full bg-black opacity-[75%] z-[9998]"
	></div>
	<div
		class="fixed top-0 left-0 w-full h-full z-[9999] flex justify-center items-center"
	>
		<div
			class="w-1/4 absolute text-center flex flex-col gap-5 p-3 items-center bg-slate-200 text-black text-lg rounded-md"
		>
			<div class="w-full leading-none" @click="(e) => toggleModal()">
				<CloseIcon class="w-[20px]" />
			</div>
			<div class="font-bold text-4xl">Hello!</div>
			<div>Use your email or another service to continue with Linkg</div>
			<div
				class="w-full flex flex-row items-center gap-2 px-4 py-2 bg-gray-400 rounded-md"
			>
				<GoogleIcon class="w-[40px]" />
				<p class="font-semibold">Sign in with Google</p>
			</div>
			<div
				class="w-full flex flex-row items-center gap-2 px-4 py-2 bg-gray-400 rounded-md"
			>
				<AppleIcon class="w-[40px]" />
				<p class="font-semibold">Sign in with Google</p>
			</div>
			<div class="w-full px-4 py-2 bg-blue-400 rounded-md font-semibold">
				Continue with email
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const { toggleModal } = defineProps<{
	toggleModal: Function;
}>();

const GoogleIcon = resolveComponent("GoogleIcon");
const AppleIcon = resolveComponent("AppleIcon");

type Icon = {
	message: string;
	icon: typeof GoogleIcon;
};

const iconArrays: Icon[] = [
	{
		message: "Sign in with Google",
		icon: GoogleIcon,
	},
	{
		message: "Sign in with Apple",
		icon: AppleIcon,
	},
];
</script>

<style scoped></style>
