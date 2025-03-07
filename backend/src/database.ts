import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { fetchRanking } from "./fetchRanking.js";
import { fetchUser } from "./fetchUser.js";

dotenv.config();

interface OsuPlayer {
    user_id: number;
    username: string;
    pp: number;
    rank: number;
    country: string;
    badges: number | null;
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
        pp REAL,
        rank INTEGER,
        country STRING,
        badges INTEGER
        )
    `);
});

async function processPlayers(page_number: string) {
    try {
        console.log(`Fetching ranking data for page ${page_number}...`);
        const data = await fetchRanking(page_number);

        const playerArray: OsuPlayer[] = data.ranking.map((rankEntry: any) => ({
            user_id: rankEntry.user.id,
            username: rankEntry.user.username,
            pp: rankEntry.pp,
            rank: rankEntry.global_rank,
            country: rankEntry.user.country_code,
            badges: null,
        }));

        console.log(
            `Fetched ranking data for page ${page_number}: `,
            playerArray
        );

        // Fetch user data in parallel
        const badgePromises = playerArray.map(async (player) => {
            try {
                const userData = await fetchUser(player.username);
                player.badges = userData.badges ? userData.badges.length : 0;
            } catch (error) {
                console.log(`Error fetching user ${player.username}:`, error);
                player.badges = 0; // Default to 0 on failure
            }
        });

        // Wait for all badge updates to complete
        await Promise.all(badgePromises);

        console.log("Updated players with badge counts:", playerArray);

        // Insert players to database
        await insertPlayersToDb(playerArray);

        console.log("All players inserted into the database");
    } catch (error) {
        console.error("Error in processPlayers:", error);
    }
}

processPlayers("1");

const insertPlayersToDb = async (playerList: OsuPlayer[]): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const stmt = db.prepare(
            "INSERT INTO osu_players (user_id, username, pp, rank, country, badges) VALUES (?, ?, ?, ?, ?, ?)"
        );

        const insertPromises = playerList.map(
            (player) =>
                new Promise<void>((resolveInsert, rejectInsert) => {
                    db.get(
                        "SELECT * FROM osu_players WHERE user_id = ?",
                        [player.user_id],
                        (err: Error | null, row: any) => {
                            if (err) {
                                console.error(
                                    "Error checking existing players:",
                                    err
                                );
                                rejectInsert(err);
                                return;
                            }

                            if (row) {
                                console.log(
                                    `Player with user_id ${player.user_id} already exists, skipping.`
                                );
                                resolveInsert();
                            } else {
                                stmt.run(
                                    player.user_id,
                                    player.username,
                                    player.pp,
                                    player.rank,
                                    player.country,
                                    player.badges,
                                    (insertErr: Error | null) => {
                                        if (insertErr) {
                                            console.error(
                                                "Error inserting player:",
                                                insertErr
                                            );
                                            rejectInsert(insertErr);
                                        } else {
                                            console.log(
                                                `Inserted player ${player.username} (user_id: ${player.user_id})`
                                            );
                                            resolveInsert();
                                        }
                                    }
                                );
                            }
                        }
                    );
                })
        );

        // Wait for all inserts to finish, then finalize statement
        Promise.all(insertPromises)
            .then(() => {
                stmt.finalize((finalizeErr) => {
                    if (finalizeErr) {
                        console.error(
                            "Error finalizing statement:",
                            finalizeErr
                        );
                        reject(finalizeErr);
                    } else {
                        console.log("All players processed.");
                        resolve();
                    }
                });
            })
            .catch(reject);
    });
};
