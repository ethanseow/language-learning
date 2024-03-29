import { Entity, Schema } from "redis-om";
import client from "./client.js";
import { randomUUID } from "crypto";
/* our entity */
class Room extends Entity {
}
class RoomUser extends Entity {
}
const roomUserSchema = new Schema(RoomUser, {
    offering: { type: "string" },
    seeking: { type: "string" },
    socketId: { type: "string" },
    userId: { type: "string" },
    isActive: { type: "boolean" },
});
const roomSchema = new Schema(Room, {
    id: { type: "string" },
    users: { type: "string[]", indexed: true },
    numInRoom: { type: "number" },
}, {
    dataStructure: "JSON",
});
/* use the client to create a Repository just for Persons */
const roomRepository = client.fetchRepository(roomSchema);
const roomUserRepository = client.fetchRepository(roomUserSchema);
await roomRepository.createIndex();
await roomUserRepository.createIndex();
const createRoom = async (user1, user2) => {
    const roomId = randomUUID();
    const roomUser1 = Object.assign(Object.assign({}, user1), { isActive: true });
    const roomUser2 = Object.assign(Object.assign({}, user2), { isActive: true });
    const room = {
        id: roomId,
        users: [user1.userId, user2.userId],
        numInRoom: 2,
    };
    const createdRoom = await roomRepository.createAndSave(room);
    await roomUserRepository.createAndSave(roomUser1);
    await roomUserRepository.createAndSave(roomUser2);
    return createdRoom;
};
const findRoomForUser = async (userId) => {
    const room = await roomRepository
        .search()
        .where("users")
        .contains(userId)
        .return.first();
    if (room) {
        return room;
    }
    else {
        null;
    }
};
const findUsersForRoom = async (room) => {
    const users = {};
    room.users.forEach(async (userId) => {
        let user = await roomUserRepository
            .search()
            .where("userId")
            .equals(userId)
            .return.first();
        users[userId] = user;
    });
    return users;
};
const findOtherUserInRoom = async (userId) => {
    const room = await findRoomForUser(userId);
    if (room) {
        const users = await findUsersForRoom(room);
        Object.keys(users).forEach((k) => {
            if (k != userId) {
                const u = users[k];
                return u;
            }
        });
    }
    else {
        return null;
    }
};
const rejoinRoom = async (userId) => {
    const room = await findRoomForUser(userId);
    if (room) {
        const users = await findUsersForRoom(room);
        if (!users) {
            return null;
        }
        const user = users[userId];
        if (user.isActive) {
            return null;
        }
        room.numInRoom += 1;
        user.isActive = true;
        await roomRepository.save(room);
        await roomUserRepository.save(user);
    }
    else {
        return null;
    }
};
const leaveRoom = async (userId) => {
    const room = await findRoomForUser(userId);
    if (room) {
        const users = await findUsersForRoom(room);
        if (!users) {
            return null;
        }
        const user = users[userId];
        if (user.isActive == false) {
            return null;
        }
        room.numInRoom -= 1;
        user.isActive = false;
        await roomRepository.save(room);
        await roomUserRepository.save(user);
    }
    else {
        return null;
    }
};
const closeRoom = async (roomId) => {
    const rooms = await roomRepository
        .search()
        .where("id")
        .equals(roomId)
        .return.all();
    const entityIds = rooms.map((room) => {
        return room.entityId;
    });
    if (entityIds.length == 0) {
        return null;
    }
    await roomRepository.remove(entityIds);
    return entityIds;
};
const clearAll = async () => {
    const rooms = await roomRepository.search().return.all();
    const users = await roomUserRepository.search().return.all();
    const roomEntityIds = rooms.map((room) => {
        return room.entityId;
    });
    const userEntityIds = users.map((user) => {
        return user.entityId;
    });
    await roomRepository.remove(roomEntityIds);
    await roomUserRepository.remove(userEntityIds);
};
export default {
    roomRepository,
    roomUserRepository,
    closeRoom,
    leaveRoom,
    rejoinRoom,
    findOtherUserInRoom,
    findRoomForUser,
    findUsersForRoom,
    createRoom,
    clearAll,
};
//# sourceMappingURL=room.js.map