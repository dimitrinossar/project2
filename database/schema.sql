CREATE DATABASE kissdogs;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    pw TEXT NOT NULL,
    username TEXT,
    location TEXT,
    bio TEXT
);

CREATE TABLE releases (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT NOT NULL,
    catalog_number TEXT NOT NULL
);

CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    release_id INT,
    user_id INT,
    price DECIMAL(6,2) NOT NULL,
    condition TEXT NOT NULL,
    info TEXT
);