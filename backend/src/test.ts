//import client from "./redis/client.js";
//console.log("process env", process.env);
//console.log(client);
import pool from "./redis/pool.js";
console.log(pool);
console.log("starting");
await pool.addToPool({
	offering: "offering",
	seeking: "seeking",
	socketId: "socketId",
	userId: "userID",
});
console.log("done");
