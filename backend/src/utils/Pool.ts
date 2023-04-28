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
			[user.userid]: user,
		};
		pool.offering[offering] = {
			...pool.offering[offering],
			[user.userid]: user,
		};
		pool.seeking[seeking] = {
			...pool.seeking[seeking],
			[user.userid]: user,
		};
		return user;
	},
	removeFromPool: (userId: string) => {
		const user = pool.findUserInPool(userId);
		if (user) {
			delete pool.offering[user.offering][user.userid];
			delete pool.seeking[user.seeking][user.userid];
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
