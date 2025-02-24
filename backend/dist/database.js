import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { fetchRanking } from "./fetchRanking.js";
dotenv.config();
const db = new sqlite3.Database("./db/badgedata.db", (err) => {
    if (err) {
        console.error("Error connecting to database");
        console.log(err);
    } else {
        console.log("Connected to database succesfully");
    }
});
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS osu_players (
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
fetchRanking("1").then((data) => {
    const playerArray = [];
    data.ranking.forEach((rankEntry) => {
        const player = {
            user_id: rankEntry.user.id,
            username: rankEntry.user.username,
            badges: null,
            rank: rankEntry.global_rank,
            pp: rankEntry.pp,
            country: rankEntry.user.country_code,
        };
        playerArray.push(player);
    });
    console.log(playerArray);
});
const insertPlayersToDb = (playerList) => {
    return new Promise((resolve) => {
        db.get(
            "SELECT * FROM osu_players WHERE user_id = ?",
            [playerList.user_id],
            (err, row) => {
                if (err) {
                    console.error("Error checking existing players: ", err);
                    resolve();
                    return;
                }
                if (row) {
                    console.log(
                        `Player with user_id ${playerList.user_id} already exists, skipping insertion.`
                    );
                    resolve();
                } else {
                    db.run(
                        "INSERT INTO osu_players (user_id, username, badges, rank, pp, country) VALUES (?, ?, ?, ?, ?)",
                        [
                            playerList.user_id,
                            playerList.username,
                            playerList.badges,
                            playerList.rank,
                            playerList.pp,
                            playerList.country,
                        ],
                        (insertErr) => {
                            if (insertErr) {
                                console.error(
                                    "Error inserting player: ",
                                    insertErr
                                );
                            } else {
                                console.log(
                                    `Inserted player ${playerList.username}(user_id: ${playerList.user_id}) `
                                );
                            }
                            resolve();
                        }
                    );
                }
            }
        );
    });
};
