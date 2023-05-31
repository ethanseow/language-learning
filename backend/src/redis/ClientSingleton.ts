import { Client as RedisClient } from "redis-om";
import { createClient } from "redis";
import dotenv from "dotenv";
import path from "path";
class Client {
	private static instance: RedisClient;
	constructor() {
		throw new Error(
			"Cannot call singleton class directly, please call getInstance"
		);
	}
	static async getInstance() {
		if (!Client.instance) {
			const envPath = path.join(__dirname, "..", "..", ".env");
			dotenv.config({ path: envPath });
			const url = process.env.REDIS_URL;
			const connection = createClient({ url });
			await connection.connect();
			const client = await new RedisClient().use(connection);
			Client.instance = client;
		}
		return Client.instance;
	}
}
export { Client };
