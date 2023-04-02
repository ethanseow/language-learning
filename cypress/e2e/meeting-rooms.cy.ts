import utils from "../consts";
const url = "http://localhost:3000";

describe("meeting room", () => {
	it("matching language pools joins", () => {
		const userId = Math.random() * 100000;
		const connectUrl = `${url}/meeting?offering=${utils.LANGUAGE_OFFERING}&seeking=${utils.LANGUAGE_SEEKING}&userId=${userId}`;
		//cy.visit(connectUrl);

		//cy.contains("Finding Available Partners").should("be.visible");

		cy.task("connectToPeer");
		cy.task("getApiBase").should("eq", "http://localhost:4000");
		//cy.contains("Finding Available Partners").should("not.be.visible");

		//expect(this.lastMessage).to.equal("hello world");
		/*
            Finish up the matching language pool rooms test here
            
        */
	});
});
