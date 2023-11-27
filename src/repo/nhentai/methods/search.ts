import {
    BookBase,
    LilithLanguage,
    SearchQueryOptions,
    SearchResult,
    Image,
    Search,
} from "../../base/interfaces";
import { UseDomParserImpl } from "../../../interfaces/domParser";
import { DefaultSearchOptions, LilithError } from "../../base";
import { ArrayUtils } from "../../utils/array";
import { useLilithLog } from "../../utils/log";
import { PromiseTools } from "../../utils/promise";
import { useRangeFinder } from "../../utils/range";
import { UseNHentaiMethodProps } from "../interfaces";
import { useNHentaiMethods } from "./base";

/**
 * Custom hook for searching NHentai using the provided options and methods.
 *
 * @param {UseNHentaiMethodProps} options - The options and methods needed for NHentai search.
 * @returns {Search} - The search function.
 */
export const useNHentaiSearch = ({
    domains: { baseUrl },
    debug,
    request,
}: UseNHentaiMethodProps): Search => {
    const { LanguageCodeMapper, extractLanguages, NHentaiPageResultSize } =
        useNHentaiMethods();

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

        const cloudflareDomCheck = document
            .find("div#content")
            .getAttribute("id");

        if (!cloudflareDomCheck) {
            throw new LilithError(
                401,
                "Cloudflare challenge triggered, we should provide the correct Cloudlflare clearance",
            );
        }

        const container = document.find("div.container");
        const lastPageAnchor = document
            .find("section.pagination a.last")
            .getAttribute("href");

        if (!container || !lastPageAnchor) {
            throw new LilithError(
                404,
                "DOM Parser failed to find necessary elements needed for this process",
            );
        }

        const pageNumberRegex = /page=(\d+)/;
        const match = lastPageAnchor.match(pageNumberRegex);
        const totalPages = match ? +match[1] : 1;

        const searchResults: UseDomParserImpl[] =
            container.findAll("div.gallery");

        if (!searchResults || searchResults.length === 0) {
            throw new LilithError(404, "No search results found");
        }

        const getLanguageFromAttribute = (
            el: UseDomParserImpl,
        ): LilithLanguage[] => {
            const languagesRetrieved = el
                .getAttribute("data-tags")
                .split(" ")
                .filter((code) =>
                    Object.keys(LanguageCodeMapper).includes(code),
                )
                .map((code) => LanguageCodeMapper[code]);
            return languagesRetrieved;
        };

        const books: BookBase[] = searchResults
            .filter((searchElement) => {
                return (
                    ArrayUtils.findCommonElements(
                        getLanguageFromAttribute(searchElement),
                        innerOptions.requiredLanguages,
                    ).length > 0
                );
            })
            .map((searchElement) => {
                const anchorElement = searchElement.find("> a");
                const bookId = anchorElement

                    .getAttribute("href")
                    .split("/")
                    .find((p) => p.length > 5); // A NH code should never be less than 6 digits

                const resultCover = anchorElement.find("img");

                const { getAttribute } = resultCover;
                const cover: Image = {
                    uri: getAttribute("data-src") || getAttribute("src") || "",
                    width: +getAttribute("width") || 0,
                    height: +getAttribute("height") || 0,
                };

                const titleElement = anchorElement.find(".caption");
                const title: string = titleElement?.getText() || "";

                let availableLanguages: LilithLanguage[] =
                    getLanguageFromAttribute(searchElement);

                if (availableLanguages.length === 0) {
                    availableLanguages = extractLanguages(title);
                }

                return {
                    id: bookId,
                    cover: cover,
                    title,
                    availableLanguages,
                };
            });

        useLilithLog(debug).log({
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
