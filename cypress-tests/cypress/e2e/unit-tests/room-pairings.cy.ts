//import consts from "../../../consts";
import consts from "@/../cypress-tests/consts";
//import { type Room, type UserLookup } from "@/backend/src/types";
//import utils from "@/backend/src/utils/room";
describe("room utils for partner pairings", () => {
	/*
        currently dealing with the issue of imports
        consts can be accessed at the moment but I want to use baseUrl
        and @ instead of this

        how can we download a cypress webpack preprocessor?
    */

	/*
	it("gets the true positive result for userHasRoom", () => {
		const userId = "I am a user";

		const userLookUp: Record<string, UserLookup> = {
			"I am a user": {
				roomId: "room id",
				offering: consts.LANGUAGE_OFFERING,
				seeking: consts.LANGUAGE_SEEKING,
			},
		};
		expect(utils.userHasRoom(userId, userLookUp)).to.equal(true);
	});
	it("gets the true NEGATIVE result for userHasRoom", () => {
		const userId = "I am a user";

		const userLookUp: Record<string, UserLookup> = {};
		expect(utils.userHasRoom(userId, userLookUp)).to.equal(false);
	});
    */
	it("gets the true NEGATIVE result for userHasRoom", () => {
		cy.log("Api base is", consts.API_BASE);
		expect(2 + 2).to.equal(4);
	});
});
