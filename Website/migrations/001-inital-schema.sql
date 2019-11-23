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
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
);
CREATE TABLE pets
(
    petname STRING, 
    species STRING, 
    gender STRING,
    age INTEGER, 
    petbio STRING, 
    otherpetinfo STRING,
    petId INTEGER PRIMARY KEY,
    FOREIGN KEY(petId) REFERENCES users(id)
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