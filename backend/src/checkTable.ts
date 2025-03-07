import dotenv from "dotenv";
import sqlite3 from "sqlite3";

dotenv.config();

const db = new sqlite3.Database("./db/badgedata.db", (err) => {
    if (err) {
        console.error("Error connecting to database");
        console.log(err);
    } else {
        console.log("Connected to database succesfully");
    }
});

db.all("SELECT * FROM osu_players", [], (err, rows) => {
    if (err) {
        console.log("Errow executing query: ", err);
        return;
    }

    if (rows.length > 0) {
        console.table(rows);
    } else {
        console.log("No data found");
    }
});
