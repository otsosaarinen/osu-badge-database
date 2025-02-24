var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            );
        });
    };
import dotenv from "dotenv";
dotenv.config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const fetchRanking = (page) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const rankingsURL = new URL(
            "https://osu.ppy.sh/api/v2/rankings/osu/performance"
        );
        if (page) {
            const parameters = { page };
            Object.keys(parameters).forEach((key) =>
                rankingsURL.searchParams.append(key, parameters[key])
            );
        } else {
            console.error("Error with parameters");
        }
        try {
            const response = yield fetch(rankingsURL, {
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
            const data = yield response.json();
            return data;
        } catch (error) {
            console.error("Error fetching ranking: ", error);
            return null;
        }
    });
fetchRanking("2").then((rankingdata) => {
    console.log(rankingdata);
});
