DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS quote;
DROP TABLE IF EXISTS anime;
DROP TABLE IF EXISTS user_list;
DROP TABLE IF EXISTS commits;

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(500) NOT NULL UNIQUE,
    password  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quote(
    id SERIAL PRIMARY KEY NOT NULL,
    anime VARCHAR(255),
    character VARCHAR(255),
    quote TEXT,
    type VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS anime(
    id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR(255),
    synopsis VARCHAR(255),
    type VARCHAR(50),
    episodes VARCHAR(10),
    score VARCHAR(10),
    image_url TEXT,
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    reated VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS user_list(
    id SERIAL PRIMARY KEY NOT NULL,
    user_id SERIAL  NOT NULL REFERENCES users(id),
    anime_id SERIAL  NOT NULL REFERENCES anime(id)
);

CREATE TABLE IF NOT EXISTS commits(
    id SERIAL PRIMARY KEY NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(500) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(50) NOT NULL
);
