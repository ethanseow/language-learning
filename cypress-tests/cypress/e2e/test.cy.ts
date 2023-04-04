describe("test", () => {
	/*
	it("checks if we can read from a data file", () => {
		const data = "hello world";
		cy.task("changeData", data);
		cy.task("readData").then((readData) => {
			expect(readData).to.be.equal(data);
		});
	});
    */
	it("checks to see if peerConnection is stable", () => {
		cy.task("checkPeerConnection").then((data: string) => cy.log(data));
	});
});
