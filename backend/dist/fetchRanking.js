import dotenv from "dotenv";
dotenv.config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const rankingsURL = new URL("https://osu.ppy.sh/api/v2/rankings/osu/performance");
const fetchRanking = (country, cursor) => {
    if (country && cursor) {
        const parameters = { country, cursor };
        Object.keys(parameters).forEach((key) => rankingsURL.searchParams.append(key, parameters[key]));
    }
    else {
        console.error("Error with parameters");
    }
    fetch(rankingsURL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
        console.log(data.ranking);
        console.log(data.cursor);
    });
    /*.then((data: Ranking) => {
            data.ranking.forEach((ranking) => {
                console.log(ranking.user);
            });
        });*/
};
fetchRanking("FI", "2");
