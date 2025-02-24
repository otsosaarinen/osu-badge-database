import dotenv from "dotenv";
dotenv.config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const username = "MALISZEWSKI";
const userURL = new URL(`https://osu.ppy.sh/api/v2/users/${username}/osu`);
const fetchUser = () => {
    fetch(userURL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
        console.log(data);
        console.log(data.badges.length);
    });
};
fetchUser();
