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

        // Fetch user data in parallel for better performance
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
                        "INSERT INTO osu_players (user_id, username, pp, rank, country, badges) VALUES (?, ?, ?, ?, ?, ?)",
                        [
                            playerList.user_id,
                            playerList.username,
                            playerList.pp,
                            playerList.rank,
                            playerList.country,
                            playerList.badges,
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
