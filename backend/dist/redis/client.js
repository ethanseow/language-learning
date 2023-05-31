import { Client } from "redis-om";
import { createClient } from "redis";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "..", "..", ".env");
dotenv.config({ path: envPath });
const url = process.env.REDIS_URL;
console.log("url for redis server", url);
export const connection = createClient({ url });
await connection.connect();
const client = await new Client().use(connection);
export default client;
//# sourceMappingURL=client.js.map