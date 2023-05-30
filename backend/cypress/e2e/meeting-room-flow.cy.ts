import pool from "@/redis/pool";
import room from "@/redis/room";
import { roomSchema, roomUserSchema } from "@/redis/RoomSingleton";
import { Client } from "@/redis/ClientSingleton";
import { expect } from "chai";
import consts from "../consts";
describe("User ", () => {
	const sessionElementID = consts.SESSION_ELEMENT_ID;
	const websiteBase = consts.WEBSITE_BASE;
	const userCookie = consts.USER_COOKIE;

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
		it("goes to /meeting with correct offering/seeking", () => {
			cy.visit(`${websiteBase}`);
			cy.setCookie("authCookie", userCookie);
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.url().should("include", "/meeting");
			cy.task("rtcConnect");
			cy.task("socketConnect");
			cy.task("waitForRoom");
			cy.get("Finding Available Partners").should("not.exist");
		});
	false &&
		it("joins a room, leaves, and rejoins", () => {
			cy.visit(`${websiteBase}`);
			cy.setCookie("authCookie", userCookie);
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.url().should("include", "/meeting");

			cy.task("rtcConnect");
			cy.task("socketConnect");
			cy.task("waitForRoom");

			cy.get("Finding Available Partners").should("not.exist");

			cy.visit(`${websiteBase}`);
			cy.visit(`${websiteBase}/dashboard`);
			cy.get(sessionElementID).click();
			cy.url().should("include", "/meeting");
			cy.get("Finding Available Partners").should("not.exist");
		});
	it("joins a room, leaves, and rejoins", async () => {
		cy.visit(`${websiteBase}`);
		cy.visit(`${websiteBase}/dashboard`);
		cy.get(sessionElementID).click();
		cy.url().should("include", "/meeting");

		cy.task("rtcConnect");
		cy.task("socketConnect");
		cy.task("waitForRoom");

		cy.get("Finding Available Partners").should("not.exist");

		const message = "hello world from mocker1";
		// this should be a cypress task

		const message2 = "bye world from myself";
		cy.get("#message-input").type(message2);
		cy.get("#message-submit").click();
		cy.contains("div", message2, { includeShadowDom: true }).should(
			"exist"
		);
		cy.task("getMockerMessages").should("deep.include", {
			message: message2,
			isMine: false,
		});
		cy.task("rtcSendMessage", message).then(() => {
			cy.contains("div", message, { includeShadowDom: true }).should(
				"exist"
			);
		});
		cy.task("getMockerMessages").should("deep.include", {
			message,
			isMine: true,
		});
	});
});
