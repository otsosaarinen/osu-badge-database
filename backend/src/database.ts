import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import fetchUser from "./fetchUser";
import fetchRanking from "./fetchRanking";

dotenv.config();

interface OsuPlayer {
    user_id: number;
    username: string;
    badges: number;
    rank: number;
    pp: number;
    country: string;
}

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
/*
let playerArray: string[] = [];

fetchRanking("1").then((data) => {
    const fetchedArray = data.ranking;
    fetchedArray.forEach((user: { username: string }) => {
        playerArray.push(user.username);
    });
});
*/
const insertPlayersToDb = (playerList: OsuPlayer): Promise<void> => {
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
