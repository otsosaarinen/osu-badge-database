import dotenv from "dotenv";
dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string;

const rankingsURL = new URL(
    "https://osu.ppy.sh/api/v2/rankings/osu/performance"
);

const fetchRanking = (country: string) => {
    const parameters: { [key: string]: string } = { country };

    Object.keys(parameters).forEach((key) =>
        rankingsURL.searchParams.append(key, parameters[key])
    );

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
