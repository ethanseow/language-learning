import pool from "@/redis/pool";
import { RTCMocker } from "../../test/RTCMocker";
import room from "@/redis/room";
import { roomSchema, roomUserSchema } from "@/redis/RoomSingleton";
import { Client } from "@/redis/ClientSingleton";
describe("User ", () => {
	const offering = "Mandarin";
	const seeking = "English";
	const userId1 = "user1";
	const userId2 = "2user";
	const authCookie1 = "cookie1";
	const authCookie2 = "cookie2";
	const websiteBase = "http://localhost:3000";
	// usually you need to set this
	const sessionElementID = "#hIfvFmJvis8jnsUK5kWU-join-meeting";
	const userCookie =
		"eyJhbGciOiJSUzI1NiIsImtpZCI6InRCME0yQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9saW5nay1iYmQwNCIsIm5hbWUiOiJFdGhhbiBTZW93IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eFlCLWVtcjR2MEtuazB1ZHU4Vi1XNXZZSGdIWG5PVFhiUlhOY0pRTVFcdTAwM2RzOTYtYyIsImF1ZCI6ImxpbmdrLWJiZDA0IiwiYXV0aF90aW1lIjoxNjg0NzczOTk0LCJ1c2VyX2lkIjoiMlV4djhzUERGZE5vRXJId0Vqamp0VW1kTWJRMiIsInN1YiI6IjJVeHY4c1BERmROb0VySHdFampqdFVtZE1iUTIiLCJpYXQiOjE2ODQ3NzM5OTUsImV4cCI6MTY4NDk4OTk5NSwiZW1haWwiOiJldGhhbnNlb3cwMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzA1MDI0NjA2NTE0ODk1NDc4NSJdLCJlbWFpbCI6WyJldGhhbnNlb3cwMEBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.Z21SZZaOW9K5L09vylf2SjkusTwwKq8kIbBr12YTkKgmkrpR2pgMoXRi5Ic6cXAlwpYGHfc3dkmnSjtwGnKLMTmjA31YqRk9B7ccFYcipDpojOKjNXz__Fci_ii-D2GRIh_xW0kbPrPl6Bd7MNgOEjCWxVpVjw7lGYNeLn6O7A2FdSQ-9UIZoEYvpdXMzaw6B28sjk1qltp9ShToTHH1mqdDbmUIPiBcN0QWSBlzJL9GmrGIOcUsG62KGouR8JQBuAYuLBM53733RrbnJWBJMUt8ir8LGOIRdP2n1DiQJZHMm-I2p24FUdLjDoP7jm_FTvh7yA6MwR9sZqhRK2UKpA";
	const mocker1 = new RTCMocker(offering, seeking, userId1, userCookie);
	beforeEach(() => {
		cy.task("clearRoom");
		cy.task("clearPool");
		if (mocker1.isFullyConnected()) {
			mocker1.disconnect();
		}
	});

	it("goes to /meeting with correct offering/seeking", () => {
		cy.visit(`${websiteBase}`);
		cy.setCookie("authCookie", userCookie);
		cy.visit(`${websiteBase}/dashboard`);
		cy.get(sessionElementID).click();
		cy.url().should("include", "/meeting");
		mocker1.rtcConnect();
		mocker1.socketConnect();
		mocker1.waitForRoom();

		cy.get("Finding Available Partners").should("not.exist");
	});
	it("joins a room, leaves, and rejoins", () => {
		cy.visit(`${websiteBase}`);
		cy.setCookie("authCookie", userCookie);
		cy.visit(`${websiteBase}/dashboard`);
		cy.get(sessionElementID).click();
		cy.url().should("include", "/meeting");
		mocker1.rtcConnect();
		mocker1.socketConnect();
		mocker1.waitForRoom();

		cy.get("Finding Available Partners").should("not.exist");

		cy.visit(`${websiteBase}`);
		cy.visit(`${websiteBase}/dashboard`);
		cy.get(sessionElementID).click();
		cy.url().should("include", "/meeting");
		cy.get("Finding Available Partners").should("not.exist");
	});
});
