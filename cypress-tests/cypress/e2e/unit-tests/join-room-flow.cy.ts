import {
	type Pool,
	type Room,
	type UserLookup,
} from "../../../../backend/src/types";
import utils from "../../../../backend/src/utils/room";
import { type JoinRoomReq } from "../../../../backend/src/sockets";
import { Server } from "../../../../backend/node_modules/socket.io";
import { io } from "../../../../frontend/node_modules/socket.io-client";
import expressApp from "../../../../backend/src/api/app";
import consts from "../../../../backend/src/consts";
describe("join room flow", () => {
	const userId = "userid";
	const language1 = "English";
	const language2 = "Mandarin";
	const data: JoinRoomReq = {
		userId,
		offering: language1,
		seeking: language2,
	};
	const app = expressApp.app;
	const server = expressApp.server;
	const apiBase = "http://localhost:4000";
	function initServer() {
		const pool: Pool = {
			offering: {},
			seeking: {},
			usersInPool: new Set(),
		};
		const reverseUserLookup: Record<string, UserLookup> = {};
		let establishedRooms: Record<string, Room> = {};
		const sio = new Server(server, {
			cors: {
				origin: consts.FRONTEND_URL,
				credentials: true,
			},
			allowRequest: (req, callback) => {
				// with HTTP long-polling, we have access to the HTTP response here, but this is not
				// the case with WebSocket, so we provide a dummy response object
				const fakeRes: Response = {
					getHeader() {
						return [];
					},
					// @ts-ignore
					setHeader(name, value) {
						req.cookieHolder = value[0];
					},
					// @ts-ignore
					writeHead() {},
				};
				// @ts-ignore
				sessionMiddleware(req, fakeRes, () => {
					if (req.session) {
						// trigger the setHeader() above

						// @ts-ignore
						fakeRes.writeHead();
						// manually save the session (normally triggered by res.end())
						req.session.save();
					}
					callback(null, true);
				});
			},
		});
		const socket = io(apiBase, {
			withCredentials: true,
		});
		const closeConnections = () => {
			sio.close();
			socket.close();
		};
		return {
			pool,
			reverseUserLookup,
			establishedRooms,
			sio,
			socket,
			closeConnections,
		};
	}
	it("adds new joined user to empty pool", () => {
		const {
			closeConnections,
			establishedRooms,
			pool,
			reverseUserLookup,
			sio,
			socket,
		} = initServer();
		const data;
		utils.joinRoomFlow();
	});
	it("does NOT add new joined user to the pool (they are already in it)", () => {});
	it("adds user to established room if they left it", () => {});
	it("does NOT add user to established room (they have not left the room)", () => {});
	it("removes user from pool when another user matches their languages", () => {});
	it("does NOT remove user from pool (no user matches their languages)", () => {});
});
