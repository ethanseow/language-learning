import consts, { ROOM_COMMANDS_ENUM as r } from "../consts";
import { Room, roomSchema, roomUserSchema } from "@/redis/RoomSingleton";
describe("User cannot join", () => {
	const sessionElementID = consts.SESSION_ELEMENT_ID;
	const websiteBase = consts.WEBSITE_BASE;
	const userCookie = consts.USER_COOKIE;
	const userId = consts.BROWSER_USER_ID;
	const goToWebsite = () => {
		cy.visit(`${websiteBase}`);
		cy.setCookie("authCookie", userCookie);
	};
	const isInRoom = () => {
		return cy.wait(3000).then(() => {
			cy.task("findUserInPool", consts.BROWSER_USER_ID).should(
				"not.exist"
			);
			cy.task("findUserInPool", consts.MOCKER_USERID1).should(
				"not.exist"
			);
			cy.task("findRoomForUser", consts.BROWSER_USER_ID)
				.should("exist")
				.then((r: Room) => {
					cy.wrap(r.users).should("include", consts.BROWSER_USER_ID);
					cy.wrap(r.users).should("include", consts.MOCKER_USERID1);
				});
		});
	};
	beforeEach(() => {
		cy.task("clearRoom");
		cy.task("clearPool");
		cy.task("isFullyConnected").then((res) => {
			if (res) {
				cy.task("disconnect");
			}
		});
		cy.setCookie("authCookie", userCookie);
	});
	false &&
		it("when meeting time is incorrect", () => {
			goToWebsite();
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.contains("Meeting time is incorrect", {
				includeShadowDom: true,
			});
		});
	false &&
		it("when languages are incorrect", () => {
			cy.setCookie("authCookie", userCookie);
			cy.request({
				url: `${websiteBase}/meeting?offering=ABC&seeking=XYZ`,
				failOnStatusCode: false, // Prevent Cypress from failing the test on non-2xx status codes
			}).then((response) => {
				expect(response.status).to.eq(404);
			});
		});
	it("when user is not logged in", () => {
		cy.visit(`${websiteBase}`);
		cy.setCookie("authCookie", "abcxyz");
		cy.visit(`${websiteBase}/dashboard`);
		cy.get(sessionElementID).click();
	});
});
