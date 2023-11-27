import {
    SearchQueryOptions,
    SearchResult,
    Search,
} from "../../base/interfaces";
import { DefaultSearchOptions, LilithError } from "../../base";
import {
    MangaDexBook,
    MangaDexCoverArt,
    MangaDexRelationship,
    MangadexResult,
    UseMangaDexMethodProps,
} from "../interfaces";
import { useLilithLog } from "../../utils/log";
import { useMangaDexMethod } from "./base";
import { useRangeFinder } from "../../utils/range";
import { UrlParamPair } from "../../../interfaces/fetch";

export const useSearch = (props: UseMangaDexMethodProps): Search => {
    const {
        domains: { apiUrl, tinyImgBaseUrl },
        debug,
        request,
    } = props;

    const {
        ImageSize,
        ReverseLanguageMapper,
        RelationshipTypes,
        getSupportedTranslations,
        findFirstTranslatedValue,
    } = useMangaDexMethod();

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
            innerOptions.requiredLanguages.map((lang) => [
                "availableTranslatedLanguage[]",
                lang,
            ]);

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

        const makeCover = (book: MangaDexBook) => {
            const mangaId = book.id;
            const coverRelationship = book.relationships.find(
                (relationship) =>
                    relationship.type === RelationshipTypes.coverArt,
            ) as MangaDexRelationship<MangaDexCoverArt>;
            if (!coverRelationship) {
                throw new LilithError(
                    404,
                    "[makeCover] No relationship found for Book",
                );
            }

            const coverFilename = coverRelationship.attributes.fileName;

            return `${tinyImgBaseUrl}/${mangaId}/${coverFilename}.${ImageSize}.jpg`; // Specifies the size (256|512)
        };

        return {
            query,
            page: innerOptions.page,
            results: result.data.map((manga) => {
                const supportedTranslations = getSupportedTranslations(
                    innerOptions.requiredLanguages,
                    manga.attributes.availableTranslatedLanguages,
                );
                const availableLanguages = supportedTranslations.map(
                    (lang) => ReverseLanguageMapper[lang],
                );

                return {
                    id: manga.id,
                    cover: {
                        uri: makeCover(manga),
                        width: 256,
                        height: 512,
                    },
                    title: findFirstTranslatedValue(manga.attributes.title),
                    availableLanguages: [...new Set(availableLanguages)],
                };
            }),
        };
    };
};
