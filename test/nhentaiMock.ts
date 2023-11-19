import { Headers, CustomFetchResponse } from "../src/interfaces/fetch";
import getMock from "./__mocks__/getMock.json";
import { randomMock } from "./__mocks__/randomMock";
import { searchMock } from "./__mocks__/searchMock";

//import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const cookies: Headers = {
    "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
    cookie: "cf_clearance=c1YVq7VO3jhJ8xYRRhUvyuEQkgazg22lMT3ZLR1I0Oo-1699994336-0-1-c1c10939.aa378de9.96c056d9-160.0.0; csrftoken=HPjWJkyKRrMKkL7jlz0TeciIVCxtSr6zVrqnUilw4si4hwlOcyGrDt1ty2SXVMWA",
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
