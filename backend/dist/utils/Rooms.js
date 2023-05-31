const rooms = {
    establishedRooms: {},
    roomLookup: {},
    findRoomForUser: (user) => {
        const roomForUser = rooms.roomLookup[user];
        if (roomForUser) {
            return Object.assign({}, roomForUser);
        }
        return null;
    },
    findOtherUserInRoom: (user) => {
        const room = rooms.findRoomForUser(user);
        if (room) {
            Object.keys(room.users).forEach((key) => {
                if (key != user) {
                    return room.users[key];
                }
            });
        }
        return null;
    },
    createRoom: (user1, user2) => {
        let randomRoomId = String(Math.round(Math.random() * 1000000)) +
            "_" +
            String(Math.round(Math.random() * 1000000));
        const room = {
            numInRoom: 2,
            id: randomRoomId,
            users: {
                [user1.userId]: Object.assign(Object.assign({}, user1), { isActive: true }),
                [user2.userId]: Object.assign(Object.assign({}, user2), { isActive: true }),
            },
            messages: [],
        };
        rooms.roomLookup[user1.userId] = room;
        rooms.roomLookup[user2.userId] = room;
        rooms.establishedRooms[randomRoomId] = room;
        return Object.assign({}, room);
    },
    rejoinRoom: (user) => {
        const room = rooms.findRoomForUser(user.userId);
        if (room) {
            // actual room by reference
            const referencedRoom = rooms.establishedRooms[room.id];
            if (referencedRoom.users[user.userId].isActive) {
                return null;
            }
            referencedRoom.numInRoom += 1;
            referencedRoom.users[user.userId].isActive = true;
            return room;
        }
        else {
            return null;
        }
    },
    leaveRoom: (userId) => {
        const room = rooms.findRoomForUser(userId);
        if (room) {
            // actual room by reference
            const referencedRoom = rooms.establishedRooms[room.id];
            if (!referencedRoom.users[userId].isActive) {
                return null;
            }
            referencedRoom.numInRoom -= 1;
            referencedRoom.users[userId].isActive = false;
            if (referencedRoom.numInRoom <= 0) {
                rooms.closeRoom(room.id);
            }
            return room;
        }
        else {
            return null;
        }
    },
    closeRoom: (roomId) => {
        const room = Object.assign({}, rooms.establishedRooms[roomId]);
        if (room) {
            delete rooms.roomLookup[roomId];
            delete rooms.establishedRooms[roomId];
            return room;
        }
        else {
            return null;
        }
    },
};
export default {
    rooms,
};
//# sourceMappingURL=Rooms.js.map