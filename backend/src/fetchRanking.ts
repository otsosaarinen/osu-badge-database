import dotenv from "dotenv";
dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string;

const fetchRanking = async (page: string) => {
    const rankingsURL = new URL(
        "https://osu.ppy.sh/api/v2/rankings/osu/performance"
    );
    if (page) {
        const parameters: { [key: string]: string } = { page };
        Object.keys(parameters).forEach((key) =>
            rankingsURL.searchParams.append(key, parameters[key])
        );
    } else {
        console.error("Error with parameters");
    }

    try {
        const response = await fetch(rankingsURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching ranking: ", error);
        return null;
    }
};

export default fetchRanking;
