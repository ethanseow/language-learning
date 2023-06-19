export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive("click-outside", {
		mounted(el, binding, vnode, prevVnode) {
			el.clickOutsideEvent = function (event) {
				console.log(binding.arg);
				console.log(event.target);
				if (event.target.class == "modal") {
					console.log("outside of the element");
					console.log("calling function");
					binding.value(event);
				}
			};

			document.body.addEventListener("click", el.clickOutsideEvent);
		},
		beforeUnmount(el, binding, vnode, prevVnode) {
			document.body.removeEventListener("click", el.clickOutsideEvent);
		},
	});
});
