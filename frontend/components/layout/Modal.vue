<!---
<template>
	<div
		id="modal"
		class="w-screen bg-background opacity-90 h-screen fixed top-0 left-0 z-[0]"
	>
		<div class="opacity-100">
			<slot> </slot>
		</div>
	</div>

	<div
		class="fixed w-screen h-screen z-[1] top-0 left-0 flex flex-col opacity-100"
	>
		<slot> </slot>
	</div>
</template>

<script setup lang="ts">
const modal = ref();
const props = defineProps<{
	closeModalFunc: Function;
}>();
const modalCloseEvent = (event: MouseEvent) => {
	console.log("modalCloseEvent is called");
	const clickedElement = event.target as HTMLElement;
	const wrapperElement = event.currentTarget as HTMLElement;

	if (clickedElement === wrapperElement) {
		console.log("modalCloseEvent - closing modal");
		props.closeModalFunc();
	}
};
onMounted(() => {
	console.log("onMounted running in bg");
	document
		.getElementById("modal")
		?.addEventListener("click", modalCloseEvent);
});
onUnmounted(() => {
	document
		.getElementById("modal")
		?.removeEventListener("click", modalCloseEvent);
});
</script>

<style scoped></style>
-->
<template>
	<div ref="modalRef" class="modal">
		<div class="modal-content">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	closeModalFunc: Function;
}>();

const modalRef = ref<HTMLElement | null>(null);

const handleBackdropClick = (event: MouseEvent) => {
	const modalElement = modalRef.value;
	if (modalElement && modalElement == event.target) {
		props.closeModalFunc();
	}
};

onMounted(() => {
	setTimeout(() => {
		document.addEventListener("click", handleBackdropClick);
	}, 0);
});

onUnmounted(() => {
	document.addEventListener("click", handleBackdropClick);
});
</script>

<style scoped>
.modal {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(5px);
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-content {
	background-color: white;
	padding: 20px;
	border-radius: 4px;
}
</style>
