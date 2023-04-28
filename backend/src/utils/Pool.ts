import { Pool, User } from "@/types";
import * as _ from "lodash";
export const pool: Pool = {
	offering: {},
	seeking: {},
	userLookup: {},
	addToPool: (user: User) => {
		const offering = user.offering;
		const seeking = user.seeking;
		pool.userLookup = {
			...pool.userLookup,
			[user.userId]: user,
		};
		pool.offering[offering] = {
			...pool.offering[offering],
			[user.userId]: user,
		};
		pool.seeking[seeking] = {
			...pool.seeking[seeking],
			[user.userId]: user,
		};
		return user;
	},
	removeFromPool: (userId: string) => {
		const user = pool.findUserInPool(userId);
		if (user) {
			delete pool.offering[user.offering][user.userId];
			delete pool.seeking[user.seeking][user.userId];
			delete pool.userLookup[userId];
			return user;
		} else {
			return null;
		}
	},
	findUserInPool: (userId: string) => {
		if (pool.userLookup.hasOwnProperty(userId)) {
			const user = pool.userLookup[userId];
			return { ...user };
		} else {
			return null;
		}
	},
	getCompatibleUser: (user: User) => {
		const offeringPool = pool.offering[user.seeking];
		const seekingPool = pool.seeking[user.offering];
		if (offeringPool && seekingPool) {
			const usersSeeking = Object.keys(seekingPool);
			const usersOffering = Object.keys(offeringPool);
			const intersection = usersSeeking.filter((value) =>
				usersOffering.includes(value)
			);
			const userId = _.sample(intersection);
			const user = { ...pool.findUserInPool(userId) };
			return user;
		}
	},
};
