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

CREATE TABLE pets
(
    petname STRING, 
    species STRING, 
    gender STRING,
    age INTEGER, 
    petbio STRING, 
    otherpetinfo STRING,
    petOwner INTEGER,
    petId INTEGER PRIMARY KEY,
    FOREIGN KEY(petOwner) REFERENCES users(id)
);

CREATE TABLE authToken(
    token STRING PRIMARY KEY,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
);

-- Down
DROP TABLE users;
DROP TABLE authToken;