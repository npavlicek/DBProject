CREATE TABLE Users (
	UID INT AUTO_INCREMENT UNIQUE,
	isAdmin BOOLEAN,
	isSuperAdmin BOOLEAN,
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
	Date TIME,
	Start TIME,
	End TIME,
	Lname VARCHAR(50) REFERENCES Location(Lname),
	Event_name VARCHAR(100),
	Description TEXT,
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
	Admins_ID INT REFERENCES Users(UID),
	SuperAdmins_ID INT REFERENCES Users(UID)
);

CREATE TABLE RSO (
	RSO_ID INT PRIMARY KEY AUTO_INCREMENT,
	Active BOOLEAN NOT NULL DEFAULT 0,
	Admins_ID INT REFERENCES Users(UID)
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
UPDATE RSOs 
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
