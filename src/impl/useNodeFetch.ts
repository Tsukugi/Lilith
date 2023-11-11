import fetch from "node-fetch";

import { CustomFetch, CustomFetchResponse } from "../interfaces/fetch";

export const useNodeFetch: CustomFetch = async (
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
