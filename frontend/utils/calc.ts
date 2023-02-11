export const range = (start: number, stop: number) => {
	return [...Array(stop - start).keys()].map((i) => i + start);
};
