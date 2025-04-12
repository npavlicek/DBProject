USE CEW;

CREATE TABLE Universities (
	UNI_ID INT PRIMARY KEY AUTO_INCREMENT,
	Name VARCHAR(30)
);

CREATE TABLE Users (
	UID INT AUTO_INCREMENT UNIQUE,
	isAdmin BOOLEAN,
	isSuperAdmin BOOLEAN,
	UNI_ID INT REFERENCES Universities(UNI_ID),
	username VARCHAR(30) PRIMARY KEY,
	password BINARY(60),
	firstName VARCHAR(30),
	lastName VARCHAR(30)
);

CREATE TABLE Location (
	Lname VARCHAR(50) PRIMARY KEY,
	Address TEXT,
	Longitude DECIMAL(10,7),
	Latitude DECIMAL(10,7)
);

CREATE TABLE Events (
	Event_ID INT AUTO_INCREMENT PRIMARY KEY,
	Date DATE,
	Start TIME,
	End TIME,
	Lname VARCHAR(50) REFERENCES Location(Lname),
	Event_name VARCHAR(100),
	Description TEXT,
	Contact_Phone VARCHAR(20),
	Contact_Email VARCHAR(40),
	Address VARCHAR(50),
	UNIQUE(Lname)
);

DELIMITER //

CREATE TRIGGER events_overlap
BEFORE INSERT ON Events
FOR EACH ROW
BEGIN 
IF EXISTS (SELECT 1 FROM Events 
	WHERE (Lname = NEW.Lname AND Date = NEW.DATE AND 
	((End - NEW.Start) > 0) AND ((NEW.End - Start) > 0))) THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Cannot have overlapping events!';
END IF;
END//

DELIMITER ;

CREATE TABLE Comments (
	Comment_text TEXT,
	Comment_rating TINYINT(3) UNSIGNED,
	Comment_timestamp TIMESTAMP NOT NULL,
	User_ID INT REFERENCES Users(UID),
	Event_ID INT REFERENCES Events(Event_ID)
);

-- CHECK THAT USER ID IS A SUPER ADMIN OR ADMIN IN NEXT 3 TABLES
CREATE TABLE Public_Events (
	Event_ID INT PRIMARY KEY REFERENCES Events(Event_ID),
	Admins_ID INT REFERENCES Users(UID),
	SuperAdmins_ID INT REFERENCES Users(UID)
);

CREATE TABLE Private_Events (
	Event_ID INT PRIMARY KEY REFERENCES Events(Event_ID),
	UNI_ID INT REFERENCES Universities(UNI_ID),
	Admins_ID INT REFERENCES Users(UID),
	SuperAdmins_ID INT REFERENCES Users(UID)
);

CREATE TABLE RSO (
	RSO_ID INT PRIMARY KEY AUTO_INCREMENT,
	Active BOOLEAN NOT NULL DEFAULT 0,
	UNI_ID INT REFERENCES Universities(UNI_ID),
	Admins_ID INT REFERENCES Users(UID),
	Name VARCHAR(200),
	Description TEXT
);

CREATE TABLE RSO_Events (
	Event_ID INT PRIMARY KEY REFERENCES Events(Event_ID),
	RSO_ID INT REFERENCES RSO(RSO_ID)
);

CREATE TABLE RSOs_Students (
	UID INT REFERENCES Users(UID),
	RSO_ID INT REFERENCES RSO(RSO_ID)
);

CREATE TRIGGER RSOStatusUpdateA
AFTER INSERT ON RSOs_Students 
FOR EACH ROW
UPDATE RSO
SET Active = 1
WHERE RSO_ID = NEW.RSO_ID
AND (SELECT COUNT(*) FROM RSOs_Students WHERE RSO_ID = NEW.RSO_ID) >= 5;

CREATE TRIGGER RSOStatusUpdateP
AFTER DELETE ON RSOs_Students
FOR EACH ROW
UPDATE RSO
SET Active = 0
WHERE RSO_ID = OLD.RSO_ID
AND (SELECT COUNT(*) FROM RSOs_Students WHERE RSO_ID = OLD.RSO_ID) < 5;

DELIMITER //

CREATE TRIGGER validate_event_admins_public_events
BEFORE INSERT ON Public_Events
FOR EACH ROW
BEGIN
	DECLARE is_admin BOOLEAN;
	DECLARE is_super_admin BOOLEAN;

	SELECT isAdmin INTO is_admin FROM Users WHERE UID = NEW.Admins_ID;
	SELECT isSuperAdmin INTO is_super_admin FROM Users WHERE UID = NEW.SuperAdmins_ID;

	IF (is_admin = FALSE OR is_super_admin = FALSE) THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Admins_ID or SuperAdmins_ID must refer to valid admins';
	END IF;
END//

CREATE TRIGGER validate_event_admins_private_events
BEFORE INSERT ON Private_Events
FOR EACH ROW
BEGIN
	DECLARE is_admin BOOLEAN;
	DECLARE is_super_admin BOOLEAN;

	SELECT isAdmin INTO is_admin FROM Users WHERE UID = NEW.Admins_ID;
	SELECT isSuperAdmin INTO is_super_admin FROM Users WHERE UID = NEW.SuperAdmins_ID;

	IF (is_admin = FALSE OR is_super_admin = FALSE) THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Admins_ID or SuperAdmins_ID must refer to valid admins';
	END IF;
END//

CREATE TRIGGER validate_admins_RSO
BEFORE INSERT ON RSO
FOR EACH ROW
BEGIN
	DECLARE is_admin BOOLEAN;

	SELECT isAdmin INTO is_admin FROM Users WHERE UID = NEW.Admins_ID;

	IF is_admin = FALSE THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Admins_ID must refer to a valid admin';
	END IF;
END//

DELIMITER ;

-- EXAMPLE DATA 
INSERT INTO Universities (Name) VALUES ("University of Central Florida");
INSERT INTO Universities (Name) VALUES ("University of South Florida");

INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 0, 1, "wojciech@aol.com", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Averia", "Moses");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 1, 2, "aglassis@aol.com", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Niklaus", "Fuller");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 0, 1, "netsfr@mac.com", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Oakley", "Baker");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (1, 0, 2, "liedra@optonline.net", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Ezra", "Wood");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 0, 1, "gfxguy@comcast.net", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Natalia", "Livingston");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 0, 2, "mcmillan@live.com", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Ambrose", "McDaniel");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 1, 1, "crowl@comcast.net", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Dahlia", "Shah");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 0, 2, "fbriere@aol.com", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Zain", "Farley");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 1, 1, "mcrawfor@msn.com", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Wrenley", "Lambert");
INSERT INTO Users (isAdmin, isSuperAdmin, UNI_ID, username, password, firstName, lastName) VALUES (0, 0, 2, "iamcal@optonline.net", "$2b$10$m1E5lmmd9ZjKwJU4P.85YeqpOztS66XpsnOCGiZor48raZXeCtf5q", "Mario", "Collins");

INSERT INTO RSO (UNI_ID, Admins_ID, Name, Description) VALUES (1, 4, "American College of Healthcare Executives", "The mission of the American College of Healthcare Executives at UCF is to support students to achieve their professional goals related to Healthcare Executive positions and being the official intermediaries between ACHE nationwide and UCF.");
INSERT INTO RSO (UNI_ID, Admins_ID, Name, Description) VALUES (1, 4, "Army Reserve Officer Training Corps", "UCF Army ROTC is dedicated to educating, developing, inspiring, and recruiting aspiring Cadets. We provide leadership, career progression, and interpersonal tact in a developmental environment. Our mission is to produce US Army Commissioned Officers. ");
INSERT INTO RSO (UNI_ID, Admins_ID, Name, Description) VALUES (1, 4, "Association of Latino Professionals for America", "The Association of Latino Professionals For America at the University of Central Florida (ALPFA UCF) is a professional development organization that seeks to build and grow the next generation of leaders and professionals.");
INSERT INTO RSO (UNI_ID, Admins_ID, Name, Description) VALUES (1, 4, "Entrepreneurship Club", "The purpose of the club is to foster interest in entrepreneurship. We're focused on building a community of entrepreneurs along with providing valuable resources such as workshops, speaker series,
and networking events.");
INSERT INTO RSO (UNI_ID, Admins_ID, Name, Description) VALUES (1, 4, "Financial Knights Association", "The Financial Knights Association recognizes academic excellence among finance majors, offering mentoring and professional opportunities with a focus on high finance careers, particularly through exposure to Wall Street firms.");
