import consts from "..../../../consts";
describe("template spec", () => {
	it("matching language pools joins", () => {
		cy.window()
			.its("console")
			.then((console) => {
				cy.stub(console, "log").callsFake((args) => {
					args.forEach((arg) => {
						expect(arg).to.not.contain("error");
					});
					// all is good, call the original log method
					cy.log(args);
				});
			});
		const userId = Math.random() * 100000;
		const connectUrl = `${consts.WEBSITE_BASE}/meeting?offering=${consts.LANGUAGE_OFFERING}&seeking=${consts.LANGUAGE_SEEKING}&userId=${userId}`;
		cy.visit(connectUrl);

		cy.contains("Finding Available Partners").should("be.visible");

		cy.task("connectToPeer");
		cy.contains("Meeting Room").should("be.visible");
	});
});
