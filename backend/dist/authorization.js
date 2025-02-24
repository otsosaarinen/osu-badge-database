import dotenv from "dotenv";
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const clientCredentialsURL = new URL("https://osu.ppy.sh/oauth/token");
