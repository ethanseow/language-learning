import { Entity, Schema } from "redis-om";
import client from "./client.js";
import { User } from "@/types";

/* our entity */
class PoolUser extends Entity {
	offering: string;
	seeking: string;
	socketId: string;
	userId: string;
}
/* create a Schema for Person */
const poolUserSchema = new Schema(PoolUser, {
	offering: { type: "string" },
	seeking: { type: "string" },
	socketId: { type: "string" },
	userId: { type: "string" },
});

/* use the client to create a Repository just for Persons */
const poolRepository = client.fetchRepository(poolUserSchema);

await poolRepository.createIndex();

const findUserInPool = async (userId: string) => {
	const entity = await poolRepository
		.search()
		.where("userId")
		.equals(userId)
		.return.first();
	return entity;
};

const addToPool = async (user: User) => {
	await poolRepository.createAndSave(user);
};

const removeFromPool = async (userId: string) => {
	const entity = await findUserInPool(userId);
	if (entity) {
		return null;
	}
	await poolRepository.remove(entity.entityId);
	return entity;
};

const getCompatibleUser = async (user: User) => {
	const entity = await poolRepository
		.search()
		.where("seeking")
		.equals(user.offering)
		.where("offering")
		.equals(user.seeking)
		.return.first();
	return entity;
};

const clearAll = async () => {
	const pool = await poolRepository.search().return.all();
	const entityIds = pool.map((pool) => {
		return pool.entityId;
	});
	await poolRepository.remove(entityIds);
};

export default {
	poolRepository,
	addToPool,
	getCompatibleUser,
	removeFromPool,
	findUserInPool,
	clearAll,
};
