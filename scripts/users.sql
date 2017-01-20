DROP TABLE IF EXISTS users;

CREATE TABLE users
(
  id SERIAL NOT NULL PRIMARY KEY,
  username VARCHAR(16) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  CHECK (char_length(username) > 6)
);
