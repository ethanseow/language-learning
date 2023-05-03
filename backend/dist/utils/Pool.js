import * as _ from "lodash";
const pool = {
    offering: {},
    seeking: {},
    userLookup: {},
    addToPool: (user) => {
        const offering = user.offering;
        const seeking = user.seeking;
        pool.userLookup = Object.assign(Object.assign({}, pool.userLookup), { [user.userId]: user });
        pool.offering[offering] = Object.assign(Object.assign({}, pool.offering[offering]), { [user.userId]: user });
        pool.seeking[seeking] = Object.assign(Object.assign({}, pool.seeking[seeking]), { [user.userId]: user });
        return user;
    },
    removeFromPool: (userId) => {
        const user = pool.findUserInPool(userId);
        if (user) {
            delete pool.offering[user.offering][user.userId];
            delete pool.seeking[user.seeking][user.userId];
            delete pool.userLookup[userId];
            return user;
        }
        else {
            return null;
        }
    },
    findUserInPool: (userId) => {
        if (pool.userLookup.hasOwnProperty(userId)) {
            const user = pool.userLookup[userId];
            return Object.assign({}, user);
        }
        else {
            return null;
        }
    },
    getCompatibleUser: (user) => {
        const offeringPool = pool.offering[user.seeking];
        const seekingPool = pool.seeking[user.offering];
        if (offeringPool && seekingPool) {
            const usersSeeking = Object.keys(seekingPool);
            const usersOffering = Object.keys(offeringPool);
            const intersection = usersSeeking.filter((value) => usersOffering.includes(value));
            const userId = _.sample(intersection);
            const user = Object.assign({}, pool.findUserInPool(userId));
            return user;
        }
    },
};
export default {
    pool,
};
//# sourceMappingURL=Pool.js.map