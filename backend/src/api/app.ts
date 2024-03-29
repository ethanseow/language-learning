import express, { Request, RequestHandler, Response } from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import cors from "cors";
import bodyParser from "body-parser";
import session, { Session, SessionOptions, Store } from "express-session";
import type { IncomingHttpHeaders, IncomingMessage } from "http";
import { app as firebaseApp, analytics } from "@/firebase";

var serviceAccount = require("../../serviceAccount.json");

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
		origin: "http://localhost:3000",
		credentials: true,
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

//console.log("certs:", certs);

const fbApp = initializeApp({
	credential: cert(serviceAccount),
});

const auth = getAuth(fbApp);

app.post("/api/login", async (req, res) => {
	console.log(`/api/login being called`);
	const { token } = req.body;

	const expiresIn = 60 * 60 * 60 * 1000 * 5;

	try {
		const options = {
			maxAge: expiresIn,
			httpOnly: true,
			secure: false,
		};

		console.log("/api/login - before create session cookie");
		try {
			const authCookie = await auth.createSessionCookie(token, {
				expiresIn,
			});
			console.log("/api/login - after create session cookie");
			console.log("Cookie:", authCookie);
			console.log("/api/login - before res cookie");
			res.cookie("authCookie", authCookie, options);
			console.log("/api/login - after res cookie");
			res.end(JSON.stringify({ status: "success" }));
		} catch (err) {
			console.log("err", err);
		}
	} catch (err) {
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
