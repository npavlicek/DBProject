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
			req.session.isAdmin = userRecord[0].isAdmin;
			req.session.isSuperAdmin = userRecord[0].isSuperAdmin;

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

app.get("/api/getUniversities", async (req, res) => {
	let response = { error: "none" };
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const res = await db.query("SELECT * FROM Universities");
		response.unis = res;
	} catch (e) {
		response.error = "fatal";
		console.error(e);
	} finally {
		db.end();
	};

	res.send(response);
});

app.get("/api/getRSOs", async (req, res) => {
	let response = { error: "none" };
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const res = await db.query("SELECT * FROM RSO");
		response.rsos = res;
	} catch (e) {
		response.error = "fatal";
		console.error(e);
	} finally {
		db.end();
	};

	res.send(response);
});

app.post("/api/joinRSO", async (req, res) => {
	console.log(req.body);
	let response = { error: "none" };
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [req.session.uid, req.body.rsoID]);
	} catch (e) {
		response.error = "fatal";
		console.error(e);
	} finally {
		db.end();
	};

	res.send(response);
});

app.post("/api/createRSO", async (req, res) => {
	let response = { error: "none" };
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const user1 = await db.query("SELECT UID FROM Users WHERE username = ?", [req.body.member1]);
		const user2 = await db.query("SELECT UID FROM Users WHERE username = ?", [req.body.member2]);
		const user3 = await db.query("SELECT UID FROM Users WHERE username = ?", [req.body.member3]);
		const user4 = await db.query("SELECT UID FROM Users WHERE username = ?", [req.body.member4]);

		console.log(user1);

		const res = await db.query("INSERT INTO RSO (Admins_ID, Name, Description) VALUES (?, ?, ?)", [req.session.uid, req.body.name, req.body.description]);
		const rsoID = parseInt(res.insertId);
		await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [req.session.uid, rsoID]);
		if (user1[0] !== undefined) {
			const user1ID = user1[0].UID;
			await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [user1ID, rsoID]);
		}
		if (user2[0] !== undefined) {
			const user2ID = user2[0].UID;
			await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [user2ID, rsoID]);
		}
		if (user3[0] !== undefined) {
			const user3ID = user3[0].UID;
			await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [user3ID, rsoID]);
		}
		if (user4[0] !== undefined) {
			const user4ID = user4[0].UID;
			await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [user4ID, rsoID]);
		}
	} catch (e) {
		response.error = "fatal";
		console.error(e);
	} finally {
		db.end();
	};

	res.send(response);
});

app.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});

