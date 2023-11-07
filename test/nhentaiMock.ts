import {
    CloudFlareConfig,
    CustomFetch,
    CustomFetchResponse,
} from "../src/interfaces";
import {
    ElementAttributes,
    ElementProps,
    UseDomParser,
    UseDomParserImpl,
} from "../src/parser/domParser";
import getMock from "./__mocks__/getMock.json";
import { randomMock } from "./__mocks__/randomMock";
import { searchMock } from "./__mocks__/searchMock";
import fetch from "node-fetch";
import { AnyNode, Cheerio, load } from "cheerio/lib/slim";

//import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const cookies: CloudFlareConfig = {
    "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
    cookie: "cf_clearance=No07bTPjTPG8ay4yw6Swd2YWsl3OOQEyUD5k3CrfLV0-1698867081-0-1-6fa998a8.7d6487d8.38a8c748-160.0.0; csrftoken=GVZOyHvhqPkKd294OAxMu2szdWS9pbU4Pp6uHPOQ2EbDjzTlePBtaF3aF8kNVnNV",
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

export const customFetchImpl: CustomFetch = async (
    url,
    options,
): Promise<CustomFetchResponse> => {
    const res = await fetch(url, options);
    return {
        text: () => res.text(), // We need this to avoid fetch/node-fetch "cannot find property 'disturbed' from undefined"
        json: <T>() => res.json() as T,
        status: res.status,
    };
};

export const useCheerioDomParser: UseDomParser = (stringDom: string) => {
    const $ = load(stringDom);

    const parser = (el: Cheerio<AnyNode>): UseDomParserImpl => {
        const find = (query: string) => parser(el.find(query).first());
        const findAll = (query: string) =>
            el
                .find(query)
                .map((_, element) => parser($(element)))
                .get();
        const getElement = (): ElementProps => {
            const attributes: Partial<ElementAttributes> = {
                href: el.attr("href") || "",
                "data-src": el.attr("data-src") || "",
                width: parseInt(el.attr("width") || "0", 10),
                height: parseInt(el.attr("height") || "0", 10),
            };
            return {
                textContent: el.text(),
                attributes,
            };
        };

        return { find, findAll, getElement };
    };

    return parser($("html"));
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
