import { Entity, Schema } from "redis-om";
import { PoolRepository } from "./PoolSingleton";
import { User } from "@/types";

const findUserInPool = async (userId: string) => {
	const poolRepository = await PoolRepository.getInstance();
	const entity = await poolRepository
		.search()
		.where("userId")
		.equals(userId)
		.return.first();
	const p = entity;
	return entity;
};

const addToPool = async (user: User) => {
	const poolRepository = await PoolRepository.getInstance();
	await poolRepository.createAndSave(user);
};

const removeFromPool = async (userId: string) => {
	const poolRepository = await PoolRepository.getInstance();
	const entity = await findUserInPool(userId);
	if (!entity) {
		return null;
	}
	await poolRepository.remove(entity.entityId);
	return entity;
};

const getCompatibleUser = async (user: User) => {
	const poolRepository = await PoolRepository.getInstance();
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
	const poolRepository = await PoolRepository.getInstance();
	const pool = await poolRepository.search().return.all();
	const entityIds = pool.map((pool) => {
		return pool.entityId;
	});
	await poolRepository.remove(entityIds);
};

export default {
	addToPool,
	getCompatibleUser,
	removeFromPool,
	findUserInPool,
	clearAll,
};
