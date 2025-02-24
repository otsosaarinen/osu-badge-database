import dotenv from "dotenv";
dotenv.config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const rankingsURL = new URL("https://osu.ppy.sh/api/v2/rankings/osu/performance");
const fetchRanking = (country) => {
    const parameters = { country };
    Object.keys(parameters).forEach((key) => rankingsURL.searchParams.append(key, parameters[key]));
    fetch(rankingsURL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
    })
        .then((response) => response.json())
        .then((data) => console.log(data));
};
fetchRanking("FI");
