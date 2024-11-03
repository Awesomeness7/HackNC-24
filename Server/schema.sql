PRAGMA journal_mode=WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE sessions(
    score INTEGER NOT NULL,
    round INTEGER NOT NULL,
    previous_images_json STRING NOT NULL,
    image_id INTEGER NOT NULL,
    FOREIGN KEY (image_id) REFERENCES images (rowid)
);

CREATE TABLE images(
    image BLOB NOT NULL,
    longitude REAL NOT NULL,
    latitude REAL NOT NULL
);