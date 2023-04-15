import express, { Request, RequestHandler, Response } from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import cors from "cors";
import bodyParser from "body-parser";
import session, { Session, SessionOptions, Store } from "express-session";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
import { app as firebaseApp, analytics } from "@/firebase";
import http from "http";
import dotenv from "dotenv";
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
app.use(
	cors({
		origin: "*",
	})
);

app.get("/", (req, res) => {
	res.send("hello world");
});

// this might need to be called on every route?
const certs = {
	clientEmail: process.env.FB_ADMIN_CLIENT_EMAIL,
	privateKey: process.env.FB_ADMIN_PRIVATE_KEY,
	projectId: process.env.FB_ADMIN_PROJECT_ID,
};

initializeApp({
	credential: cert(certs),
});

app.post("/api/login", async (req, res) => {
	const { token } = req.body;

	const expiresIn = 60 * 60 * 24 * 5 * 1000;

	try {
		const options = {
			maxAge: expiresIn,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		};

		const authCookie = await getAuth().createSessionCookie(token, {
			expiresIn,
		});
		res.cookie("authCookie", authCookie, options);
		res.end(JSON.stringify({ status: "success" }));
	} catch (err) {
		throw { statusCode: 401, statusMessage: "Unauthorized" };
	}
});

app.post("/api/logout", async (req, res) => {
	res.clearCookie("authCookie");
});

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});

export default {
	app,
	sessionMiddleware,
	server,
};
