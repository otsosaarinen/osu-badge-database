import dotenv from "dotenv";
dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string;

export const fetchUser = async (username: string) => {
    const userURL = new URL(`https://osu.ppy.sh/api/v2/users/${username}/osu`);

    try {
        const response = await fetch(userURL, {
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
        console.error("Error fetching user: ", error);
        return null;
    }
};
