const express = require("express");
const mariadb = require("mariadb");
const expressSession = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
const port = 8000;

app.use(express.json());
const mills_in_minute = 60000;
app.use(expressSession({ secret: 'keyboard cat', saveUninitialized: false, resave: false }));

app.post("/api/register", async (req, res) => {
	let isAdmin = false;
	let isSuperAdmin = false;
	if (req.body.role === "admin") {
		isAdmin = true;
	} else if (req.body.role === "superadmin") {
		isSuperAdmin = true;
	}

	const hashedPass = await bcrypt.hash(req.body.password, 10);

	let response = { error: "none" };
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		await db.query("INSERT INTO Users (username, password, firstName, lastName, isAdmin, isSuperAdmin) VALUES (?, ?, ?, ?, ?, ?)", [req.body.username, hashedPass, req.body.firstName, req.body.lastName, isAdmin, isSuperAdmin]);
	} catch (e) {
		response.error = "username_in_use";
		console.error(e);
	} finally {
		db.end();
	};

	res.send(response);
});

app.post("/api/logout", async (req, res) => {
	req.session.destroy();
});

app.post("/api/login", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	let response = { error: "none" };
	let userRecord = undefined;
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		userRecord = await db.query("SELECT UID, firstName, lastName, username, password, isAdmin, isSuperAdmin FROM Users WHERE username = ?", [username]);
	} catch (e) {
		response.error = "fatal";
		console.error(e);
	} finally {
		db.end();
	};

	if (userRecord.length > 0) {
		if (bcrypt.compareSync(password, userRecord[0].password.toString())) {
			req.session.loggedIn = true;
			req.session.uid = userRecord[0].UID;
			req.session.cookie.maxAge = mills_in_minute * 30;

			response.firstName = userRecord[0].firstName;
			response.lastName = userRecord[0].lastName;

			if (userRecord[0].isAdmin) {
				response.isAdmin = true;
			} else if (userRecord[0].isSuperAdmin) {
				response.isSuperAdmin = true;
			} else {
				response.isStudent = true;
			}
		} else {
			response.error = "invalid_cred";
		}
	} else {
		response.error = "invalid_cred";
		req.session.destroy();
	}

	res.send(response);
});

app.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});

