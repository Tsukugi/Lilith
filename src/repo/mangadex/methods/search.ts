import {
    SearchQueryOptions,
    SearchResult,
    Search,
} from "../../base/interfaces";
import { DefaultSearchOptions, LilithError } from "../../base";
import {
    MangaDexBook,
    MangadexResult,
    UseMangaDexMethodProps,
} from "../interfaces";
import { useLilithLog } from "../../utils/log";
import { useMangaDexMethod } from "./base";
import { useRangeFinder } from "../../utils/range";
import { UrlParamPair } from "../../../interfaces/fetch";

export const useMangaDexSearchMethod = (
    props: UseMangaDexMethodProps,
): Search => {
    const {
        domains: { apiUrl },
        options: { debug, requiredLanguages },
        request,
    } = props;

    const { RelationshipTypes, getLanguageParams, getBookResults } =
        useMangaDexMethod(props.domains);

    return async (
        query: string,
        options?: Partial<SearchQueryOptions>,
    ): Promise<SearchResult> => {
        const innerOptions: Partial<SearchQueryOptions> = {
            ...DefaultSearchOptions,
            ...options,
        };

        const { pageToRange } = useRangeFinder({ pageSize: innerOptions.size });
        const { startIndex } = pageToRange(innerOptions.page);

        const languageParams: UrlParamPair[] =
            getLanguageParams(requiredLanguages);

        useLilithLog(debug).log({
            startIndex,
            innerOptions,
        });

        const response = await request<MangadexResult<MangaDexBook[]>>(
            `${apiUrl}/manga`,
            [
                ["title", query],
                ["includes[]", RelationshipTypes.coverArt],
                ["limit", innerOptions.size],
                ["offset", startIndex],
                ...languageParams,
            ],
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No search results");
        }

        const result = await response.json();

        return {
            query,
            page: innerOptions.page,
            results: getBookResults(result.data, requiredLanguages),
        };
    };
};
