import pool from "@/redis/pool";
import room from "@/redis/room";
import { Room, roomSchema, roomUserSchema } from "@/redis/RoomSingleton";
import { Client } from "@/redis/ClientSingleton";
import { expect } from "chai";
import consts, { ROOM_COMMANDS_ENUM as r } from "../consts";
describe("User ", () => {
	const sessionElementID = consts.SESSION_ELEMENT_ID;
	const websiteBase = consts.WEBSITE_BASE;
	const userCookie = consts.USER_COOKIE;
	const userId = consts.BROWSER_USER_ID;
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

	true &&
		it("goes to /meeting with correct offering/seeking", function () {
			cy.visit(`${websiteBase}`);
			cy.setCookie("authCookie", userCookie);
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.url().should("include", "/meeting");
			cy.task("rtcConnect");
			cy.task("socketConnect");
			cy.task("waitForRoom");

			isInRoom();
		});
	true &&
		it("joins a room, leaves, and rejoins", function () {
			cy.visit(`${websiteBase}`);
			cy.setCookie("authCookie", userCookie);
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.url().should("include", "/meeting");

			cy.task("rtcConnect");
			cy.task("socketConnect");
			cy.task("waitForRoom");

			isInRoom().then(() => {
				cy.visit(`${websiteBase}`);
				cy.visit(`${websiteBase}/dashboard`);
				cy.get(sessionElementID).click();
				cy.url().should("include", "/meeting");
				isInRoom();
			});
		});
	true &&
		it("joins a room and messages", async function () {
			cy.visit(`${websiteBase}`);
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.url().should("include", "/meeting");

			cy.task("rtcConnect");
			cy.task("socketConnect");
			cy.task("waitForRoom");

			isInRoom().then(() => {
				const message = "hello world from mocker1";
				// this should be a cypress task

				const message2 = "bye world from myself";
				cy.get("#message-input").type(message2);
				cy.get("#message-submit").click();
				cy.contains("div", message2, { includeShadowDom: true });
				cy.task("getMockerMessages").should("deep.include", {
					message: message2,
					isMine: false,
				});
				cy.task("rtcSendMessage", message).then(() => {
					cy.contains("div", message, { includeShadowDom: true });
				});
				cy.task("getMockerMessages").should("deep.include", {
					message,
					isMine: true,
				});
			});
		});
	true &&
		it("joins a room, other user leaves, and room should be destroyed", async function () {
			cy.visit(`${websiteBase}`);
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.url().should("include", "/meeting");

			cy.task("rtcConnect");
			cy.task("socketConnect");
			cy.task("waitForRoom");

			isInRoom().then(() => {
				cy.task("disconnect");

				cy.visit(`${websiteBase}`);

				cy.task("getMockerUserId").then((userId) => {
					cy.task("findRoomForUser", userId).then((roomForUser) => {
						cy.wrap(roomForUser).should("not.exist");
					});
				});
			});
		});
	true &&
		it("joins a room, other user leaves, and room should be destroyed", async function () {
			cy.visit(`${websiteBase}`);
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.url().should("include", "/meeting");

			cy.task("rtcConnect");
			cy.task("socketConnect");
			cy.task("waitForRoom");

			isInRoom().then(() => {
				cy.get("#endMeeting")
					.click()
					.then(() => {
						cy.task("findRoomForUser", consts.BROWSER_USER_ID).then(
							(roomForUser) => {
								cy.wrap(roomForUser).should("not.exist");
							}
						);
						cy.task("findRoomForUser", consts.MOCKER_USERID1).then(
							(roomForUser) => {
								cy.wrap(roomForUser).should("not.exist");
							}
						);
					});
			});
		});
});
