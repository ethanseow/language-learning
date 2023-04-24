import * as dotenv from "dotenv";
import {
	getSessions,
	userHasMatchingSession,
} from "../../../../frontend/utils/firebase";
import { initializeApp } from "../../../../frontend/node_modules/firebase/app";
import { getAuth } from "../../../../frontend/node_modules/firebase/auth";
import {
	collection,
	getFirestore,
} from "../../../../frontend/node_modules/firebase/firestore";
console.log({ ...Cypress.env() });
describe("firebase util", () => {
	const userId = "2Uxv8sPDFdNoErHwEjjjtUmdMbQ2";
	const rightNow = new Date();
	const app = initializeApp({ ...Cypress.env() });
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	it("gets the correct result for when our meeting time is not correct", async () => {
		const session = await userHasMatchingSession(
			firestore,
			userId,
			"English",
			"Mandrin",
			rightNow
		);
		assert(session == null);
	});
	it("gets the correct result for when our meeting time is correct", async () => {
		//const sessions = await getSessions(firestore, true, userId);
		const April13Midnight2023 = new Date(
			"Thu Apr 13 2023 00:00:00 GMT-0400 (Eastern Daylight Time)"
		);
		cy.log(April13Midnight2023.toISOString());
		cy.log(April13Midnight2023.getTimezoneOffset() + "");
		const session = await userHasMatchingSession(
			firestore,
			userId,
			"English",
			"Mandrin",
			April13Midnight2023
		);
		console.log(session);
	});
});
