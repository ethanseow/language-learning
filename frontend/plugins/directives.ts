export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive("click-outside", {
		mounted(el, binding, vnode, prevVnode) {
			el.clickOutsideEvent = function (event) {
				if (binding.value.id) {
					const id = binding.value.id;
					console.log(binding.arg);
					console.log(event.target);
					if (event.target.id == id) {
						console.log("outside of the element");
						console.log("calling function");
						binding.value.func(event);
					}
				}
			};

			document.body.addEventListener("click", el.clickOutsideEvent);
		},
		beforeUnmount(el, binding, vnode, prevVnode) {
			document.body.removeEventListener("click", el.clickOutsideEvent);
		},
	});
});
