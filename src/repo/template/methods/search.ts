import {
    SearchQueryOptions,
    SearchResult,
    Search,
} from "../../base/interfaces";
import { DefaultSearchOptions } from "../../base";
import { UseMethodProps } from "../interfaces";
import { useLilithLog } from "../../utils/log";

export const useSearchMethod = (props: UseMethodProps): Search => {
    const {
        domains: { baseUrl },
        debug,
        request,
    } = props;

    return async (
        query: string,
        options?: Partial<SearchQueryOptions>,
    ): Promise<SearchResult> => {
        const innerOptions: Partial<SearchQueryOptions> = {
            ...DefaultSearchOptions,
            ...options,
        };

        const response = await request(`${baseUrl}/search`, [
            ["q", query],
            ["sort", innerOptions.sort],
            ["page", innerOptions.page],
        ]);

        useLilithLog(debug).log(response);

        return {
            query,
            totalPages: 0,
            totalResults: 0,
            page: innerOptions.page,
            results: [],
        };
    };
};
