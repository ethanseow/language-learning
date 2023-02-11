export const range = (start: number, stop: number) => {
	return [...Array(stop - start + 1).keys()].map((i) => i + start);
};
