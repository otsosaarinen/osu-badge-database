import dotenv from "dotenv";
dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string;

const rankingsURL = new URL(
    "https://osu.ppy.sh/api/v2/rankings/osu/performance"
);

interface User {
    avatar_url: string;
    country: {
        code: string;
        name: string;
    };
    country_code: string;
    cover: {
        custom_url: string | null;
        id: string;
        url: string;
    };
    default_group: string;
    id: number;
    is_active: boolean;
    is_bot: boolean;
    is_online: boolean;
    is_supporter: boolean;
    last_visit: string;
    pm_friends_only: boolean;
    profile_colour: string | null;
    username: string;
}

interface Ranking {
    cursor: string | null;
    ranking: {
        grade_counts: {
            a: number;
            s: number;
            sh: number;
            ss: number;
            ssh: number;
        };
        hit_accuracy: number;
        is_ranked: boolean;
        level: {
            current: number;
            progress: number;
        };
        maximum_combo: number;
        play_count: number;
        play_time: number | null;
        pp: number;
        global_rank: number;
        ranked_score: number;
        replays_watched_by_others: number;
        total_hits: number;
        total_score: number;
        user: User;
    }[];
    total: number;
}

const fetchRanking = (country: string, cursor: string) => {
    if (country && cursor) {
        const parameters: { [key: string]: string } = { country, cursor };
        Object.keys(parameters).forEach((key) =>
            rankingsURL.searchParams.append(key, parameters[key])
        );
    } else {
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
