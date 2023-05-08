import { Client } from "./ClientSingleton";
import { createClient } from "redis";
import dotenv from "dotenv";
import path from "path";
import { Entity, EntityData, Repository, Schema } from "redis-om";
import { User } from "@/types";
class PoolUser extends Entity {
	userId: string;
	getUserId(): string {
		return this.toJSON()["userId"];
	}
	getOffering(): string {
		return this.toJSON()["offering"];
	}
	getSocketId(): string {
		return this.toJSON()["socketId"];
	}
	getSeeking(): string {
		return this.toJSON()["seeking"];
	}
}
const poolUserSchema = new Schema(PoolUser, {
	offering: { type: "string" },
	seeking: { type: "string" },
	socketId: { type: "string" },
	userId: { type: "string" },
});
class PoolRepository {
	private static instance: Repository<PoolUser>;
	constructor() {
		throw new Error(
			"Cannot call singleton class directly, please call getInstance"
		);
	}
	static async getInstance() {
		/* create a Schema for Person */
		if (!PoolRepository.instance) {
			const client = await Client.getInstance();
			const poolRepository = client.fetchRepository(poolUserSchema);
			await poolRepository.createIndex();
			PoolRepository.instance = poolRepository;
		}
		return PoolRepository.instance;
	}
}
export { PoolRepository };
