import { BookListResults, GetLatestBooks } from "../../base/interfaces";
import {
    MangaDexBook,
    MangadexResult,
    UseMangaDexMethodProps,
} from "../interfaces";
import { useLilithLog } from "../../utils/log";
import { LilithError, MaxLatestBooksSize } from "../../base";
import { UrlParamPair } from "../../../interfaces/fetch";
import { useMangaDexMethod } from "./base";
import { useRangeFinder } from "../../utils/range";

/**
 * Custom hook for fetching the latest NHentai books using the provided options and methods.
 *
 * @param {UseMangaDexMethodProps} props - The options and methods needed for NHentai latest book retrieval.
 * @returns {GetLatestBooks} - The function for fetching the latest books.
 */
export const useMangaDexGetLatestBooksMethod = (
    props: UseMangaDexMethodProps,
): GetLatestBooks => {
    const {
        domains: { apiUrl },
        options: { debug, requiredLanguages },
        request,
    } = props;

    const { getLanguageParams, getBookResults, RelationshipTypes } =
        useMangaDexMethod(props.domains);

    return async (page: number): Promise<BookListResults> => {
        const languageParams: UrlParamPair[] =
            getLanguageParams(requiredLanguages);

        const pageSize = MaxLatestBooksSize;
        const { pageToRange } = useRangeFinder({ pageSize });
        const { startIndex } = pageToRange(page);

        const response = await request<MangadexResult<MangaDexBook[]>>(
            `${apiUrl}/manga`,
            [
                ["limit", pageSize],
                ["offset", startIndex],
                ["includes[]", RelationshipTypes.coverArt],
                ...languageParams,
            ],
        );

        const result = await response.json();

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No search results");
        }
        useLilithLog(debug).log({ response });

        return {
            page,
            results: getBookResults(result.data, requiredLanguages),
        };
    };
};
