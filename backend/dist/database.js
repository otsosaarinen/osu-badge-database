import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./backend/db/badges.db", (err) => {
    if (err) {
        console.error("Error connecting to database");
        console.log(err);
    }
    else {
        console.log("Connected to database succesfully");
    }
});
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS badges (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        username STRING NOT NULL,
        badges INTEGER,
        rank INTEGER,
        pp REAL,
        country STRING
        )
    `);
});
