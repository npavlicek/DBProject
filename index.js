const express = require("express");
const mariadb = require("mariadb");
const expressSession = require("express-session");
const bcrypt = require("bcrypt");
const proxy = require("express-http-proxy");
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
		await db.query("INSERT INTO Users (username, password, firstName, lastName, isAdmin, isSuperAdmin, UNI_ID) VALUES (?, ?, ?, ?, ?, ?, ?)", [req.body.username, hashedPass, req.body.firstName, req.body.lastName, isAdmin, isSuperAdmin, req.body.uni]);
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
		userRecord = await db.query("SELECT UID, firstName, lastName, username, password, isAdmin, isSuperAdmin, UNI_ID FROM Users WHERE username = ?", [username]);
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
			req.session.UNI_ID = userRecord[0].UNI_ID;

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
		const res = await db.query("SELECT * FROM RSO WHERE UNI_ID = ?", [req.session.UNI_ID]);
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

app.get("/api/getCurrentRSOs", async (req, res) => {
	let response = { error: "none" };
	response.rsos = [];

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const rsos = await db.query("SELECT * FROM RSOs_Students WHERE UID = ?", [req.session.uid]);

		for (let i = 0; i < rsos.length; i++) {
			const rso = await db.query("SELECT * FROM RSO WHERE RSO_ID = ?", [rsos[i].RSO_ID]);
			response.rsos.push(rso[0]);
		}
	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

app.get("/api/getPublicEvents", async (req, res) => {
	let response = { error: "none" };
	response.evs = [];

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const evs = await db.query("SELECT * FROM Public_Events");

		for (let i = 0; i < evs.length; i++) {
			const ev = await db.query("SELECT * FROM Events WHERE Event_ID = ?", [evs[i].Event_ID]);
			response.evs.push(ev[0]);
		}
	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

app.get("/api/getPrivateEvents", async (req, res) => {
	let response = { error: "none" };
	response.evs = [];

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const evs = await db.query("SELECT * FROM Private_Events WHERE UNI_ID = ?", [req.session.UNI_ID]);

		for (let i = 0; i < evs.length; i++) {
			const ev = await db.query("SELECT * FROM Events WHERE Event_ID = ?", [evs[i].Event_ID]);
			response.evs.push(ev[0]);
		}
	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

app.get("/api/getRSOEvents", async (req, res) => {
	let response = { error: "none" };
	response.evs = [];

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const rsos = await db.query("SELECT * FROM RSOs_Students WHERE UID = ?", [req.session.uid]);
		for (let j = 0; j < rsos.length; j++) {
			const evs = await db.query("SELECT * FROM RSO_Events WHERE RSO_ID = ?", [rsos[j].RSO_ID]);

			for (let i = 0; i < evs.length; i++) {
				const ev = await db.query("SELECT * FROM Events WHERE Event_ID = ?", [evs[i].Event_ID]);
				response.evs.push(ev[0]);
			}
		}
	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

async function getUIDByUsername(username) {
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	let res;
	try {
		res = await db.query("SELECT UID FROM Users WHERE username = ?", [username]);
	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	let uid = false;
	if (res.length > 0) {
		uid = res[0].UID;
	}

	return uid;
}

app.post("/api/createRSO", async (req, res) => {
	let response = { error: "none" };
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const user1 = await getUIDByUsername(req.body.member1);
		const user2 = await getUIDByUsername(req.body.member2);
		const user3 = await getUIDByUsername(req.body.member3);
		const user4 = await getUIDByUsername(req.body.member4);

		const res = await db.query("INSERT INTO RSO (Admins_ID, Name, Description, UNI_ID) VALUES (?, ?, ?, ?)", [req.session.uid, req.body.name, req.body.description, req.body.uni]);
		const rsoID = parseInt(res.insertId);
		await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [req.session.uid, rsoID]);
		if (user1 !== false) {
			await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [user1, rsoID]);
		}
		if (user2 !== false) {
			await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [user2, rsoID]);
		}
		if (user3 !== false) {
			await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [user3, rsoID]);
		}
		if (user4 !== false) {
			await db.query("INSERT INTO RSOs_Students (UID, RSO_ID) VALUES (?, ?)", [user4, rsoID]);
		}
	} catch (e) {
		response.error = "fatal";
		console.error(e);
	} finally {
		db.end();
	};

	res.send(response);
});

app.post("/api/leaveRSO", async (req, res) => {
	let response = { error: "none" };

	const RSO_ID = req.body.RSO_ID;

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		await db.query("DELETE FROM RSOs_Students WHERE RSO_ID = ? AND UID = ?", [RSO_ID, req.session.uid]);
	} catch (err) {
		console.error(err);
	} finally {
		db.end();
	}

	res.send(response);
});

app.post("/api/createPublicEvent", async (req, res) => {
	let response = { error: "none" };

	const data = req.body;

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const insertInfo = await db.query("INSERT INTO Events (Date, Start, End, Event_name, Description, Contact_Phone, Contact_Email, Address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [data.date, data.start, data.end, data.name, data.desc, data.phone, data.email, data.addr]);

		await db.query("INSERT INTO Public_Events (Event_ID, Admins_ID) VALUES (?, ?)", [parseInt(insertInfo.insertId), req.session.uid]);

	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

app.post("/api/createPrivateEvent", async (req, res) => {
	let response = { error: "none" };

	const data = req.body;

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const insertInfo = await db.query("INSERT INTO Events (Date, Start, End, Event_name, Description, Contact_Phone, Contact_Email, Address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [data.date, data.start, data.end, data.name, data.desc, data.phone, data.email, data.addr]);

		await db.query("INSERT INTO Private_Events (Event_ID, Admins_ID, UNI_ID) VALUES (?, ?, ?)", [parseInt(insertInfo.insertId), req.session.uid, req.session.UNI_ID]);

	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

app.post("/api/createRSOEvent", async (req, res) => {
	let response = { error: "none" };

	const data = req.body;

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		const insertInfo = await db.query("INSERT INTO Events (Date, Start, End, Event_name, Description, Contact_Phone, Contact_Email, Address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [data.date, data.start, data.end, data.name, data.desc, data.phone, data.email, data.addr]);

		await db.query("INSERT INTO RSO_Events (Event_ID, RSO_ID) VALUES (?, ?)", [parseInt(insertInfo.insertId), data.RSO_ID]);

	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

app.post("/api/postComment", async (req, res) => {
	let response = { error: "none" };

	const data = req.body;

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		await db.query("INSERT INTO Comments (Event_ID, User_ID, Comment_text, Comment_rating, Comment_timestamp) VALUES (?, ?, ?, ?, ?)", [data.Event_ID, req.session.uid, data.comment, data.rating, new Date().toISOString().slice(0, 19).replace('T', ' ')]);
	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

async function getUsernameByID(id) {
	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	let res;
	try {
		res = await db.query("SELECT username FROM Users WHERE UID = ?", [id]);
	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	if (res[0]) {
		return res[0].username;
	} else {
		return '';
	}
}

app.post("/api/getComments", async (req, res) => {
	let response = { error: "none" };

	const data = req.body;

	const db = await mariadb.createConnection({ socketPath: '/run/mysqld/mysqld.sock', user: 'niko', database: "CEW" });
	try {
		response.comments = await db.query("SELECT * FROM Comments WHERE Event_ID = ?", [data.Event_ID]);

		for (let i = 0; i < response.comments.length; i++) {
			response.comments[i].username = await getUsernameByID(response.comments[i].User_ID);
		}
	} catch (e) {
		console.error(e);
	} finally {
		db.end();
	}

	res.send(response);
});

app.use(proxy("http://127.0.0.1:3000"));

app.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});

