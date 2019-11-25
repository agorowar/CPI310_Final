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
CREATE TABLE pets
(
    id INTEGER PRIMARY KEY,
    petname STRING, 
    species STRING, 
    gender STRING,
    age INTEGER, 
    petbio STRING, 
    otherpetinfo STRING,
    petOwner STRING,
    FOREIGN KEY(petOwner) REFERENCES users(email)
);

CREATE TABLE authToken(
    token STRING PRIMARY KEY,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
);

-- Down
DROP TABLE users;
DROP TABLE profileImages;
DROP TABLE petImages;
DROP TABLE pets;
DROP TABLE authToken;