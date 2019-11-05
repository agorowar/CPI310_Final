-- Up
CREATE TABLE users
(
    id INTEGER PRIMARY KEY,
    email STRING,
    name STRING,
    password STRING
);

-- Down
DROP TABLE users;