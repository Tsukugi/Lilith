import { UseDomParserImpl } from "./domParser";

export interface Result<T> {
    statusCode: number;
    json: () => Promise<T>;
    getDocument: () => Promise<UseDomParserImpl>;
}

export type CustomFetch = (
    url: string,
    options: CustomFetchInitOptions,
) => Promise<CustomFetchResponse>;

export interface CustomFetchResponse {
    text: () => Promise<string>;
    json: <T>() => Promise<T>;
    status: number;
}

export interface CustomFetchInitOptions {
    method: "GET" | "POST";
    headers: Headers;
    credentials: "include" | "omit" | "same-origin";
    body?: XMLHttpRequestBodyInit | null;
}

export interface Headers {
    [x: string]: string;
    ["User-Agent"]: string;
    cookie: string;
}
