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
    FOREIGN KEY(petId) REFERENCES users(id)
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
    petOwner INTEGER,
    FOREIGN KEY(petOwner) REFERENCES users(id)
);

CREATE TABLE authToken(
    token STRING PRIMARY KEY,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
);

CREATE TABLE matches(
    id INTEGER PRIMARY KEY,
    pet1 INTEGER,
    pet2 INTEGER,
    FOREIGN KEY(pet1) REFERENCES pets(id),
    FOREIGN KEY(pet2) REFERENCES pets(id)
);

CREATE TABLE dislikeMatch(
    id INTEGER PRIMARY KEY,
    pet1 INTEGER,
    pet2 INTEGER,
    FOREIGN KEY(pet1) REFERENCES pets(id),
    FOREIGN KEY(pet2) REFERENCES pets(id)
);

CREATE TABLE potMatch(
    id INTEGER PRIMARY KEY,
    initialPet INTEGER,
    matchedPet INTEGER,
    FOREIGN KEY(initialPet) REFERENCES pets(id),
    FOREIGN KEY(matchedPet) REFERENCES pets(id)
);

-- Down
DROP TABLE users;
DROP TABLE profileImages;
DROP TABLE petImages;
DROP TABLE pets;
DROP TABLE authToken;
DROP TABLE matches;
DROP TABLE dislikeMatch;
DROP TABLE potMatch;