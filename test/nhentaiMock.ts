import { CustomFetch } from "../src/interfaces";
import getMock from "./getMock.json";

export const cookies = {
    userAgent: "",
    cfClearance: "",
};

export const fetchMock: CustomFetch = async () => {
    return {
        text: async () => JSON.stringify(getMock),
        json: async () => Promise.resolve(getMock),
        status: 200,
    };
};
