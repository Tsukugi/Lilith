import { CustomFetchInitOptions } from "../interfaces/fetch";

enum ResponseType {
    "JSON",
    "Text",
}

export type RequestParams = Record<string, string> | string[][] | string;

interface RequestOptions {
    params: Record<string, string> | string[][];
    requestOptions: Partial<CustomFetchInitOptions>;
}

export const requestBase = async <T>(
    type: ResponseType,
    url: string,
    { params, requestOptions }: Partial<RequestOptions> = {},
): Promise<T | string> => {
    const queryString = new URLSearchParams(params).toString();
    const apiUrl = `${url}?${queryString}`;

    const response = await fetch(apiUrl, requestOptions);

    if (type === ResponseType.JSON) return await response.json();
    if (type === ResponseType.Text) return await response.text();
};
