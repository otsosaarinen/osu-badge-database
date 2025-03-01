import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { fetchRanking } from "./fetchRanking.js";
import { fetchUser } from "./fetchUser.js";

dotenv.config();

interface OsuPlayer {
    user_id: number;
    username: string;
    badges: number | null;
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

async function processPlayers(page_number: string) {
    try {
        console.log(`Fetching ranking data for page ${page_number}...`);
        const data = await fetchRanking(page_number);
        const playerArray: OsuPlayer[] = data.ranking.map((rankEntry: any) => ({
            user_id: rankEntry.user.id,
            username: rankEntry.user.username,
            rank: rankEntry.global_rank,
            pp: rankEntry.pp,
            badges: null, // Will update later
            country: rankEntry.user.country_code,
        }));

        console.log("Fetched ranking data:", playerArray);

        // Fetch user data in parallel for better performance
        const badgePromises = playerArray.map(async (player) => {
            try {
                const userData = await fetchUser(player.username); // Use username as intended
                player.badges = userData.badges ? userData.badges.length : 0;
            } catch (error) {
                console.log(`Error fetching user ${player.username}:`, error);
                player.badges = 0; // Default to 0 on failure
            }
        });

        // Wait for all badge updates to complete
        await Promise.all(badgePromises);

        console.log("Updated players with badge counts:", playerArray);
    } catch (error) {
        console.error("Error in processPlayers:", error);
    }
}

processPlayers("1");

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
                            playerList.rank,
                            playerList.pp,
                            playerList.badges,
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
