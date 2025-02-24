import dotenv from "dotenv";
dotenv.config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const rankingsURL = new URL("https://osu.ppy.sh/api/v2/rankings/osu/performance");
const fetchRanking = (country, page) => {
    if (country || page) {
        const parameters = { country, page };
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
        console.log(rankingsURL);
    });
    /*.then((data: Ranking) => {
            data.ranking.forEach((ranking) => {
                console.log(ranking.user);
            });
        });*/
};
fetchRanking("FI", "2");
