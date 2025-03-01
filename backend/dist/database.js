var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { fetchRanking } from "./fetchRanking.js";
import { fetchUser } from "./fetchUser.js";
dotenv.config();
const db = new sqlite3.Database("./db/badgedata.db", (err) => {
    if (err) {
        console.error("Error connecting to database");
        console.log(err);
    }
    else {
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
function processPlayers(page_number) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Fetching ranking data for page ${page_number}...`);
            const data = yield fetchRanking(page_number);
            const playerArray = data.ranking.map((rankEntry) => ({
                user_id: rankEntry.user.id,
                username: rankEntry.user.username,
                rank: rankEntry.global_rank,
                pp: rankEntry.pp,
                badges: null, // Will update later
                country: rankEntry.user.country_code,
            }));
            console.log("Fetched ranking data:", playerArray);
            // Fetch user data in parallel for better performance
            const badgePromises = playerArray.map((player) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const userData = yield fetchUser(player.username); // Use username as intended
                    player.badges = userData.badges ? userData.badges.length : 0;
                }
                catch (error) {
                    console.log(`Error fetching user ${player.username}:`, error);
                    player.badges = 0; // Default to 0 on failure
                }
            }));
            // Wait for all badge updates to complete
            yield Promise.all(badgePromises);
            console.log("Updated players with badge counts:", playerArray);
        }
        catch (error) {
            console.error("Error in processPlayers:", error);
        }
    });
}
processPlayers("1");
const insertPlayersToDb = (playerList) => {
    return new Promise((resolve) => {
        db.get("SELECT * FROM osu_players WHERE user_id = ?", [playerList.user_id], (err, row) => {
            if (err) {
                console.error("Error checking existing players: ", err);
                resolve();
                return;
            }
            if (row) {
                console.log(`Player with user_id ${playerList.user_id} already exists, skipping insertion.`);
                resolve();
            }
            else {
                db.run("INSERT INTO osu_players (user_id, username, badges, rank, pp, country) VALUES (?, ?, ?, ?, ?)", [
                    playerList.user_id,
                    playerList.username,
                    playerList.rank,
                    playerList.pp,
                    playerList.badges,
                    playerList.country,
                ], (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting player: ", insertErr);
                    }
                    else {
                        console.log(`Inserted player ${playerList.username}(user_id: ${playerList.user_id}) `);
                    }
                    resolve();
                });
            }
        });
    });
};
