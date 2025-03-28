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
        pp REAL,
        rank INTEGER,
        country STRING,
        badges INTEGER
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
                pp: rankEntry.pp,
                rank: rankEntry.global_rank,
                country: rankEntry.user.country_code,
                badges: null,
            }));
            console.log(`Fetched ranking data for page ${page_number}: `, playerArray);
            // Fetch user data in parallel
            const badgePromises = playerArray.map((player) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const userData = yield fetchUser(player.username);
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
            // Insert players to database
            yield insertPlayersToDb(playerArray);
            console.log("All players inserted into the database");
        }
        catch (error) {
            console.error("Error in processPlayers:", error);
        }
    });
}
processPlayers("1");
const insertPlayersToDb = (playerList) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO osu_players (user_id, username, pp, rank, country, badges) VALUES (?, ?, ?, ?, ?, ?)");
        const insertPromises = playerList.map((player) => new Promise((resolveInsert, rejectInsert) => {
            db.get("SELECT * FROM osu_players WHERE user_id = ?", [player.user_id], (err, row) => {
                if (err) {
                    console.error("Error checking existing players:", err);
                    rejectInsert(err);
                    return;
                }
                if (row) {
                    console.log(`Player with user_id ${player.user_id} already exists, skipping.`);
                    resolveInsert();
                }
                else {
                    stmt.run(player.user_id, player.username, player.pp, player.rank, player.country, player.badges, (insertErr) => {
                        if (insertErr) {
                            console.error("Error inserting player:", insertErr);
                            rejectInsert(insertErr);
                        }
                        else {
                            console.log(`Inserted player ${player.username} (user_id: ${player.user_id})`);
                            resolveInsert();
                        }
                    });
                }
            });
        }));
        // Wait for all inserts to finish, then finalize statement
        Promise.all(insertPromises)
            .then(() => {
            stmt.finalize((finalizeErr) => {
                if (finalizeErr) {
                    console.error("Error finalizing statement:", finalizeErr);
                    reject(finalizeErr);
                }
                else {
                    console.log("All players processed.");
                    resolve();
                }
            });
        })
            .catch(reject);
    });
});
