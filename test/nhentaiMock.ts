import { CustomFetch } from "../src/interfaces";
import getMock from "./getMock.json";

export const cookies = {
    userAgent:
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
    cfClearance:
        "No07bTPjTPG8ay4yw6Swd2YWsl3OOQEyUD5k3CrfLV0-1698867081-0-1-6fa998a8.7d6487d8.38a8c748-160.0.0",
};

export const fetchMock: CustomFetch = async () => {
    return {
        text: async () => JSON.stringify(getMock),
        json: async () => Promise.resolve(getMock),
        status: 200,
    };
};
