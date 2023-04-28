import { Socket } from "socket.io";

export const sockets = {
	userToSocketLookup: {},
	socketToUserLookup: {},
	initializeNewPair: (socketId: string, userId: string) => {
		if (
			sockets.findSocketForUser(userId) ||
			sockets.findUserForSocket(socketId)
		) {
			return false;
		}
		sockets.userToSocketLookup[socketId] = userId;
		sockets.socketToUserLookup[userId] = socketId;
		return true;
	},
	joinRoom: (socket: Socket, roomId: string) => {},
	findSocketForUser: (userId: string) => {
		return sockets.userToSocketLookup[userId];
	},
	findUserForSocket: (socketId: string) => {
		return sockets.userToSocketLookup[socketId];
	},
};
