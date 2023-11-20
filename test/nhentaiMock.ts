import { CustomFetchResponse } from "../src/interfaces/fetch";
import getMock from "./__mocks__/getMock.json";
import { randomMock } from "./__mocks__/randomMock";
import { searchMock } from "./__mocks__/searchMock";
import dotenv from "dotenv";

//import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

dotenv.config();

const userAgent = process.env.USER_AGENT || "";
const cookie = process.env.COOKIE || "";

export const headers = {
    "User-Agent": userAgent,
    cookie: cookie,
};

export enum TextMocksForDomParser {
    "Search",
    "Random",
}

export const fetchMock = async (
    res = {} as Partial<CustomFetchResponse>,
    textMock: TextMocksForDomParser = TextMocksForDomParser.Search,
): Promise<CustomFetchResponse> => {
    return {
        text:
            res.text ||
            (async () => {
                if (textMock === TextMocksForDomParser.Random)
                    return randomMock;
                return searchMock;
            }),
        json: res.json || (async <T>() => getMock as T),
        status: res.status || 200,
    };
};

// * Havent tested this one
// export const customAxiosImpl: CustomFetch = async (url, options) => {
//     const response = await axios({
//         url,
//         method: options.method || "get",
//         headers: options.headers,
//         data: options.body,
//     });

//     return {
//         text: () => Promise.resolve(response.data.toString()),
//         json: <T>() => Promise.resolve(response.data as T),
//         status: response.status,
//     };
// };

// * This is broken as we XMLHttpRequest is not on node
// export const useXMLHttpRequestImpl: CustomFetch = (url, options) => {
//     return new Promise<CustomFetchResponse>((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open(options.method || "GET", url, true);

//         if (options.headers) {
//             for (const [header, value] of Object.entries(options.headers)) {
//                 xhr.setRequestHeader(header, value);
//             }
//         }

//         xhr.onload = function () {
//             const response: CustomFetchResponse = {
//                 text: () => Promise.resolve(xhr.responseText),
//                 json: <T>() =>
//                     Promise.resolve(JSON.parse(xhr.responseText) as T),
//                 status: xhr.status,
//             };
//             resolve(response);
//         };

//         xhr.onerror = function () {
//             reject(new Error("XMLHttpRequest failed"));
//         };
//         if (options.body) {
//             xhr.send(options.body);
//         } else {
//             xhr.send();
//         }
//     });
// };
