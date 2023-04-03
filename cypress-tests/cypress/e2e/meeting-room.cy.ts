import consts from "..../../../consts";
describe("template spec", () => {
	it("matching language pools joins", () => {
		const userId = Math.random() * 100000;
		const connectUrl = `${consts.WEBSITE_BASE}/meeting?offering=${consts.LANGUAGE_OFFERING}&seeking=${consts.LANGUAGE_SEEKING}&userId=${userId}`;
		cy.visit(connectUrl);

		cy.contains("Finding Available Partners").should("be.visible");

		cy.task("connectToPeer");

		cy.contains(".video-player").should("be.visible");
	});
});
