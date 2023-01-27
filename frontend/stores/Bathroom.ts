import { defineStore } from "pinia";

interface Item {
	name: string;
	price: number;
	stock: number;
	id: number;
}
export const useBathroomStore = defineStore("bathroomItems", {
	state: () => ({
		items: [
			{
				id: 1,
				name: "vanity",
				price: 123,
				stock: 15,
			},
			{
				id: 2,
				name: "mirror",
				price: 13,
				stock: 1,
			},
			{
				id: 3,
				name: "tub",
				price: 12,
				stock: 15,
			},
		],
	}),
	getters: {
		findById: (state) => {
			return (id: number) => state.items.find((item) => item.id == id);
		},
		filterLessThan: (state) => {
			return (price: number) =>
				state.items.filter((item) => item.price <= price);
		},
	},
});
