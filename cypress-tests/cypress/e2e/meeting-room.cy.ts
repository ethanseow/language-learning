import consts from "..../../../consts";
import { Pool, Rooms, User } from "@/../backend/src/types";
import { RTCMocker } from "@/RTCMocker";
import axios from "axios";
import {
	isPermissionAllowed,
	isPermissionBlocked,
	isPermissionAsk,
} from "cypress-browser-permissions";

const getPoolRoomData = async () => {
	const poolRoomData = await axios.get(
		`${consts.SOCKET_API_BASE}/get_lookups`
	);
	const pool: Pool = poolRoomData.data?.pool;
	const rooms: Rooms = poolRoomData.data?.rooms;
	return {
		pool,
		rooms,
	};
};

describe("meeting page", () => {
	beforeEach(() => {
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
		const cookie =
			"eyJhbGciOiJSUzI1NiIsImtpZCI6InRCME0yQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9saW5nay1iYmQwNCIsIm5hbWUiOiJFdGhhbiBTZW93IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eFlCLWVtcjR2MEtuazB1ZHU4Vi1XNXZZSGdIWG5PVFhiUlhOY0pRTVFcdTAwM2RzOTYtYyIsImF1ZCI6ImxpbmdrLWJiZDA0IiwiYXV0aF90aW1lIjoxNjgyMzA2ODM1LCJ1c2VyX2lkIjoiMlV4djhzUERGZE5vRXJId0Vqamp0VW1kTWJRMiIsInN1YiI6IjJVeHY4c1BERmROb0VySHdFampqdFVtZE1iUTIiLCJpYXQiOjE2ODIzMDY4MzYsImV4cCI6MTY4MjczODgzNiwiZW1haWwiOiJldGhhbnNlb3cwMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzA1MDI0NjA2NTE0ODk1NDc4NSJdLCJlbWFpbCI6WyJldGhhbnNlb3cwMEBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.ld5RfurHOvbaqtcLdXpPBPVe3Qvan9vhww9YP_74YC_aEsFVXnxSRpgZtL1enr4VMUBeNs0k-f1yXcrRw4SHfkSa48U2t56VCGyduUEzIPQQQk_CXxh60YkktOYAA2KOoJLmy3KqNrP0N56lv-rco4_Z1C1AwJwBxnyJxCsYnXi_YEbXdgylpm0xkcHKuWTtxdOsswF3BXf7ZGnDqQKvNvzMt9KWbrjVoQxJ7-sLSNsA_frqaQDw9s35BB6gnX82oMct72625H5CDmumqn4pW7NaGQc_ETqX7tmm4vOEwUIQE7OfAjENXFczxKS_FLdc8ARh0YOegLLMFgA_ty5ctA";
		cy.setCookie("authCookie", cookie);
		isPermissionAllowed("microphone") && isPermissionAllowed("camera");
	});
	it("user joins empty pool", async () => {
		let mocker = new RTCMocker(
			consts.LANGUAGE_SEEKING,
			consts.LANGUAGE_OFFERING
		);
		// may need to make user login repeatedly
		const userId = "2Uxv8sPDFdNoErHwEjjjtUmdMbQ2";
		const connectUrl = `${consts.WEBSITE_BASE}/meeting?offering=${consts.LANGUAGE_OFFERING}&seeking=${consts.LANGUAGE_SEEKING}`;
		cy.visit(connectUrl);

		cy.contains("Finding Available Partners").should("be.visible");

		mocker.waitForRoom();

		const { pool, rooms } = await getPoolRoomData();

		expect(pool, "current pool").to.exist;
		expect(rooms, "current rooms").to.exist;
		expect(pool.offering[consts.LANGUAGE_OFFERING][userId]).to.not.exist;
		expect(pool.offering[consts.LANGUAGE_SEEKING][userId]).to.not.exist;
		expect(pool.userLookup[userId]).to.not.exist;

		expect(rooms.findRoomForUser(userId));
	});
	it("user joins empty pool", async () => {
		// may need to make user login repeatedly
		const userId = "2Uxv8sPDFdNoErHwEjjjtUmdMbQ2";
		const connectUrl = `${consts.WEBSITE_BASE}/meeting?offering=${consts.LANGUAGE_OFFERING}&seeking=${consts.LANGUAGE_SEEKING}`;
		cy.visit(connectUrl);

		cy.contains("Finding Available Partners").should("be.visible");

		const { pool, rooms } = await getPoolRoomData();

		expect(pool.userLookup, "pool lookup is not empty").to.not.deep.equal(
			{}
		);
		expect(pool.offering, "pool offering is not empty").to.not.deep.equal(
			{}
		);
		expect(pool.seeking, "pool seeking is not empty").to.not.deep.equal({});
		expect(rooms.roomLookup, "room lookup is empty").to.deep.equal({});
		expect(
			rooms.establishedRooms,
			"established rooms is empty"
		).to.deep.equal({});
		const offeringPool = pool?.offering?.[consts.LANGUAGE_OFFERING];
		const seekingPool = pool?.seeking?.[consts.LANGUAGE_SEEKING];

		expect(offeringPool?.[userId], "offer language in pool").to.exist;
		expect(seekingPool?.[userId], "seeking language in pool").to.exist;

		//cy.task("connectToPeer");

		const poolRoomData2 = await axios.get(
			`${consts.SOCKET_API_BASE}/get_lookups`
		);

		//cy.contains("Meeting Room").should("be.visible");
	});
});
