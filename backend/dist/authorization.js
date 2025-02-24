import dotenv from "dotenv";
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const clientCredentialsURL = new URL("https://osu.ppy.sh/oauth/token");
const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
};
let body = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials&scope=public`;
fetch(clientCredentialsURL, {
    method: "POST",
    headers,
    body: body,
})
    .then((response) => response.json())
    .then((data) => console.log(data));
