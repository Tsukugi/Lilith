export enum LilithRepo {
    NHentai = "NHentai",
}

export interface Result<T> {
    statusCode: number;
    json: () => Promise<T>;
    getDocument: () => Promise<Document>;
}

export type CustomFetch = (
    url: string,
    options: CustomFetchInitOptions,
) => Promise<CustomFetchResponse>;

export interface CustomFetchResponse {
    text: () => Promise<string>;
    json: () => Promise<unknown>;
    status: number;
}

export interface CustomFetchInitOptions {
    method: "GET" | "POST";
    headers: CustomHeaders;
    credentials: "include" | "omit" | "same-origin";
}

interface CustomHeaders {
    [x: string]: string;
    "User-Agent": string;
}
export interface CloudFlareConfig {
    userAgent: string;
    cfClearance: string;
}
