import {
    BookBase,
    SearchQueryOptions,
    SearchResult,
    Search,
} from "../../base/interfaces";
import { DefaultSearchOptions, LilithError } from "../../base";
import { useLilithLog } from "../../utils/log";
import { PromiseTools } from "../../utils/promise";
import { useRangeFinder } from "../../utils/range";
import { UseNHentaiMethodProps } from "../interfaces";
import { useNHentaiMethods } from "./base";
import { UseDomParserImpl } from "../../../interfaces/domParser";

/**
 * Custom hook for searching NHentai using the provided options and methods.
 *
 * @param {UseNHentaiMethodProps} options - The options and methods needed for NHentai search.
 * @returns {Search} - The search function.
 */
export const useNHentaiSearchMethod = ({
    domains: { baseUrl },
    options: { debug, requiredLanguages },
    request,
}: UseNHentaiMethodProps): Search => {
    const { getGalleries, NHentaiPageResultSize } = useNHentaiMethods();

    /**
     * Function for extracting the total number of pages
     *
     * @param {UseDomParserImpl} document - The parsed DOM document.
     * @returns {number} - The total number of pages.
     */
    const getTotalPages = (document: UseDomParserImpl): number => {
        // Extracting the last page anchor from the document
        const lastPageAnchor = document
            .find("section.pagination a.last")
            .getAttribute("href");

        // Handling case where the last page anchor is not found
        if (!lastPageAnchor) {
            throw new LilithError(
                404,
                "DOM Parser failed to find necessary elements needed for this process",
            );
        }

        // Extracting the page number from the last page anchor
        const pageNumberRegex = /page=(\d+)/;
        const match = lastPageAnchor.match(pageNumberRegex);

        // Returning the total number of pages (or defaulting to 1 if not found)
        return match ? +match[1] : 1;
    };

    /**
     * Internal function for generic NHentai search.
     *
     * @param {string} query - The search query.
     * @param {Partial<SearchQueryOptions>} options - Additional search options.
     * @returns {Promise<SearchResult>} - The search result.
     */
    const searchGeneric = async (
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

        const document = await response.getDocument();

        const totalPages: number = getTotalPages(document);
        const books: BookBase[] = getGalleries(document, requiredLanguages);

        useLilithLog(debug).log({
            totalPages,
            availableLanguages: books.map((book) => book.availableLanguages),
        });

        return {
            query: query,
            totalPages,
            page: innerOptions.page,
            totalResults: NHentaiPageResultSize * totalPages,
            results: books,
        };
    };

    /**
     * Main function for NHentai search, handling pagination and sequential search.
     *
     * @param {string} query - The search query.
     * @param {Partial<SearchQueryOptions>} options - Additional search options.
     * @returns {Promise<SearchResult>} - The search result.
     */
    return async (
        query: string,
        options?: Partial<SearchQueryOptions>,
    ): Promise<SearchResult> => {
        const innerOptions: SearchQueryOptions = {
            ...DefaultSearchOptions,
            ...options,
        };

        const { pageToRange, rangeToPagination } = useRangeFinder({
            pageSize: innerOptions.size,
        });

        const range = pageToRange(innerOptions.page);
        const pagination = rangeToPagination(range.startIndex, range.endIndex);
        let sequentialRes: SearchResult = { results: [] } as SearchResult;

        await PromiseTools.recursivePromiseChain({
            promises: new Array(pagination.length).fill(null).map(
                (_, index) => () =>
                    searchGeneric(query, {
                        ...innerOptions,
                        page: index + pagination[0],
                    }),
            ),
            numLevels: pagination.length,
            onPromiseSettled: async (result) => {
                sequentialRes = {
                    ...sequentialRes,
                    ...result,
                    results: [...sequentialRes.results, ...result.results],
                };
            },
        });

        return {
            ...sequentialRes,
            results: sequentialRes.results,
        };
    };
};
