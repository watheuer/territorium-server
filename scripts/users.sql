DROP TABLE IF EXISTS users;

CREATE TABLE users
(
  id SERIAL NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE CHECK (email <> ''),
  username VARCHAR(16) NOT NULL UNIQUE CHECK (username <> ''),
  password TEXT NOT NULL CHECK (password <> ''),

  created TIMESTAMPTZ,  -- player register date
  last_login TIMESTAMPTZ,  -- last login
  item_key TEXT,  -- secret key for player items during session

  CHECK (char_length(username) > 6)
);
