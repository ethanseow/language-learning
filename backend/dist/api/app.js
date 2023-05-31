import express from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import http from "http";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: __dirname + "/./../../.env" });
const app = express();
const port = 4000;
const server = http.createServer(app);
const sessionMiddleware = session({
    secret: "changed",
    resave: false,
    saveUninitialized: true,
});
app.use(bodyParser.json());
// app.use(sessionMiddleware);
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("hello world");
});
// this might need to be called on every route?
const certs = {
    clientEmail: process.env.FB_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FB_ADMIN_PRIVATE_KEY,
    projectId: process.env.FB_ADMIN_PROJECT_ID,
};
const fbApp = initializeApp({
    credential: cert(certs),
});
const auth = getAuth(fbApp);
app.post("/api/login", async (req, res) => {
    const { token } = req.body;
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    try {
        const options = {
            maxAge: expiresIn,
            httpOnly: true,
            secure: false,
        };
        const authCookie = await auth.createSessionCookie(token, {
            expiresIn,
        });
        console.log("Cookie:", authCookie);
        res.cookie("authCookie", authCookie, options);
        res.end(JSON.stringify({ status: "success" }));
    }
    catch (err) {
        throw { statusCode: 401, statusMessage: "Unauthorized" };
    }
});
app.post("/api/logout", async (req, res) => {
    res.clearCookie("authCookie");
    res.end(JSON.stringify({ status: "success" }));
});
app.post("/test", async (req, res) => {
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const options = {
        maxAge: expiresIn,
        httpOnly: false,
        secure: false,
        sameSite: false,
    };
    res.cookie("cookie", "this is a cookie", options);
    res.end(JSON.stringify({ status: "success" }));
});
server.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
export default {
    app,
    sessionMiddleware,
    server,
};
//# sourceMappingURL=app.js.map