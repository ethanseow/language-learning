import { Client } from "./ClientSingleton";
import { createClient } from "redis";
import dotenv from "dotenv";
import path from "path";
import { Entity, Repository, Schema } from "redis-om";
class Room extends Entity {
	id: string;
	users: string[];
	numInRoom: number;
}
class RoomUser extends Entity {
	offering: string;
	seeking: string;
	socketId: string;
	userId: string;
	isActive: boolean;
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
});
class RoomUserRepository {
	private static instance: Repository<RoomUser>;
	constructor() {
		throw new Error(
			"Cannot call singleton class directly, please call getInstance"
		);
	}
	static async getInstance() {
		/* create a Schema for Person */
		if (!RoomUserRepository.instance) {
			const client = await Client.getInstance();
			const poolRepository = client.fetchRepository(roomUserSchema);
			await poolRepository.createIndex();
			RoomUserRepository.instance = poolRepository;
		}
		return RoomUserRepository.instance;
	}
}
class RoomRepository {
	private static instance: Repository<Room>;
	constructor() {
		throw new Error(
			"Cannot call singleton class directly, please call getInstance"
		);
	}
	static async getInstance() {
		/* create a Schema for Person */
		if (!RoomRepository.instance) {
			const client = await Client.getInstance();
			const poolRepository = client.fetchRepository(roomSchema);
			await poolRepository.createIndex();
			RoomRepository.instance = poolRepository;
		}
		return RoomRepository.instance;
	}
}
export { RoomRepository, RoomUserRepository, Room, RoomUser };
