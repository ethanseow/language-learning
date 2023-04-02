describe("template spec", () => {
	it("matching language pools joins", () => {
		const userId = Math.random() * 100000;
		const connectUrl = `${constants.API_BASE}/meeting?offering=${constants.LANGUAGE_OFFERING}&seeking=${constants.LANGUAGE_SEEKING}&userId=${userId}`;
		cy.visit(connectUrl);

		cy.contains("Finding Available Partners").should("be.visible");

		cy.task("connectToPeer");

		cy.contains(".video-player").should("be.visible");
	});
});
