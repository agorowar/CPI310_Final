-- Up
CREATE TABLE users
(
    id INTEGER PRIMARY KEY,
    email STRING,
    name STRING,
    password STRING,
    location STRING,
    bio STRING
);
<<<<<<< HEAD
CREATE TABLE profileImages
(
    fileName STRING PRIMARY KEY,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
);
CREATE TABLE petImages
(
    fileName STRING PRIMARY KEY,
    petId INTEGER,
    FOREIGN KEY(petId) REFERENCES pets(id)
);
=======

>>>>>>> 85f82c59688910f0c317b04cb4b7f48ee7c8270f
CREATE TABLE pets
(
    id INTEGER PRIMARY KEY,
    petname STRING, 
    species STRING, 
    gender STRING,
    age INTEGER, 
    petbio STRING, 
    otherpetinfo STRING,
<<<<<<< HEAD
    petOwner STRING,
    FOREIGN KEY(petOwner) REFERENCES users(email)
=======
    petOwner INTEGER,
    petId INTEGER PRIMARY KEY,
    FOREIGN KEY(petOwner) REFERENCES users(id)
>>>>>>> 85f82c59688910f0c317b04cb4b7f48ee7c8270f
);

CREATE TABLE authToken(
    token STRING PRIMARY KEY,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
);

-- Down
DROP TABLE users;
DROP TABLE authToken;