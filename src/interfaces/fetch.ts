import { UseDomParserImpl } from "./domParser";

export interface Result<T> {
    statusCode: number;
    json: () => Promise<T>;
    getDocument: () => Promise<UseDomParserImpl>;
}

export type CustomFetch = (
    url: string,
    options: Partial<CustomFetchInitOptions>,
) => Promise<CustomFetchResponse>;

export interface CustomFetchResponse {
    text: () => Promise<string>;
    json: <T>() => Promise<T>;
    status: number;
}

export interface CustomFetchInitOptions {
    method: "GET" | "POST";
    headers: LilithHeaders;
    credentials: "include" | "omit" | "same-origin";
    body?: string; // TODO: Support me!
}

export interface LilithHeaders {
    [x: string]: string;
    ["User-Agent"]: string;
    cookie: string;
}

export type UrlParamPair = [string, UrlParamValue];
export type UrlParamValue = string | number | boolean;

export type LilithRequest = <T>(
    url: string,
    params?: UrlParamPair[],
) => Promise<Result<T>>;
