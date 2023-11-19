import {
    CustomFetchInitOptions,
    Result,
    UrlParamPair,
} from "../interfaces/fetch";
import {
    Book,
    SearchResult,
    RepositoryTemplate,
    Chapter,
    LilithError,
    LilithLanguage,
    Tag,
    SearchQueryOptions,
} from "../interfaces/base";
import {
    MangaDexAuthor,
    MangaDexBook,
    MangaDexChapter,
    MangaDexCoverArt,
    MangaDexImageListResult,
    MangaDexLanguage,
    MangaDexRelationship,
    MangadexResult,
} from "../interfaces/repositories/mangadex";
import { useLilithLog } from "./utils/log";
import { useRequest } from "./utils/request";
import { ArrayUtils } from "./utils/array";

enum RelationshipTypes {
    coverArt = "cover_art",
    author = "author",
    manga = "manga",
    tag = "tag",
}

const imageSize: "256" | "512" = "512";

const LanguageMapper: Record<LilithLanguage, MangaDexLanguage[]> = {
    [LilithLanguage.english]: [MangaDexLanguage.EN],
    [LilithLanguage.japanese]: [MangaDexLanguage.JA, MangaDexLanguage.JA_RO],
    [LilithLanguage.spanish]: [MangaDexLanguage.ES, MangaDexLanguage.ES_LA],
    [LilithLanguage.mandarin]: [
        MangaDexLanguage.ZH,
        MangaDexLanguage.ZH_HK,
        MangaDexLanguage.ZH_RO,
    ],
};

const reverseLanguageMapper = ((): Record<MangaDexLanguage, LilithLanguage> => {
    const res = {} as Record<MangaDexLanguage, LilithLanguage>;
    Object.keys(LanguageMapper).forEach((key) => {
        LanguageMapper[key].forEach((value) => {
            res[value] = key;
        });
    });
    return res;
})();

const findFirstTranslatedValue = (record: Record<MangaDexLanguage, string>) =>
    Object.values(record)[0] || "";

const getSupportedTranslations = (
    requiredLanguages: LilithLanguage[],
    availableTranslatedLanguages: MangaDexLanguage[],
) => {
    const requiredMangaDexLanguages = requiredLanguages.flatMap(
        (lang) => LanguageMapper[lang],
    );
    const supportedTranslations = ArrayUtils.findCommonElements(
        requiredMangaDexLanguages,
        availableTranslatedLanguages,
    );

    const doesHaveTranslations = supportedTranslations.length > 0;
    if (!doesHaveTranslations) {
        throw new LilithError(
            404,
            "No translation for the requested language available",
        );
    }

    return supportedTranslations;
};

/*
 * MangaDex API docs https://api.mangadex.org/docs/swagger.html
 * @param props
 * @returns
 */
export const useMangaDexRepository: RepositoryTemplate = (props) => {
    const { doRequest } = useRequest(props);
    const { debug } = props;

    const baseUrl = "https://mangadex.org";
    const apiUrl = "https://api.mangadex.org";

    const imgBaseUrl = "https://uploads.mangadex.org/data";
    const tinyImgBaseUrl = "https://uploads.mangadex.org/covers";

    const request = async <T>(
        url: string,
        params: UrlParamPair[] = [],
    ): Promise<Result<T>> => {
        const requestOptions: Partial<CustomFetchInitOptions> = {
            method: "GET",
        };
        return doRequest(url, params, requestOptions);
    };

    const getChapter = async (identifier: string): Promise<Chapter | null> => {
        const response = await request<MangaDexImageListResult>(
            `${apiUrl}/at-home/server/${identifier}`,
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(
                response?.statusCode,
                "No chapter images found",
            );
        }

        const chapter = await request<MangadexResult<MangaDexChapter>>(
            `${apiUrl}/chapter/${identifier}`,
        );

        if (!chapter || chapter?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No chapter found");
        }
        const imagesResult = await response.json();
        const chapterResult = await chapter.json();

        return {
            id: identifier,
            pages: imagesResult.chapter.data.map((filename) => ({
                uri: `${imgBaseUrl}/${imagesResult.chapter.hash}/${filename}`,
            })),

            title: chapterResult.data.attributes.title,
            language:
                reverseLanguageMapper[
                    chapterResult.data.attributes.translatedLanguage
                ],
            chapterNumber: +chapterResult.data.attributes.chapter,
        };
    };

    const getBook = async (
        identifier: string,
        requiredLanguages: LilithLanguage[] = Object.values(LilithLanguage),
    ): Promise<Book | null> => {
        const manga = await request<MangadexResult<MangaDexBook>>(
            `${apiUrl}/manga/${identifier}`,
            [
                ["includes[]", RelationshipTypes.coverArt],
                ["includes[]", RelationshipTypes.author],
            ],
        );

        if (!manga || manga?.statusCode !== 200) {
            throw new LilithError(manga?.statusCode, "No manga found");
        }

        const mangaResult = await manga.json();

        const { tags, title, availableTranslatedLanguages } =
            mangaResult.data.attributes;

        const supportedTranslations = getSupportedTranslations(
            requiredLanguages,
            availableTranslatedLanguages,
        );

        useLilithLog(debug).log(
            supportedTranslations,
            availableTranslatedLanguages,
        );

        const languageParams: UrlParamPair[] = supportedTranslations.map(
            (lang) => ["translatedLanguage[]", lang],
        );

        const feed = await request<MangadexResult<MangaDexChapter[]>>(
            `${apiUrl}/manga/${identifier}/feed`,
            [["order[chapter]", "asc"], ...languageParams],
        );

        if (!feed || feed?.statusCode !== 200) {
            throw new LilithError(feed?.statusCode, "No manga feed found");
        }

        const chaptersResult = await feed.json();

        const relationships: Record<string, unknown> = (() => {
            const res = {};
            mangaResult.data.relationships.forEach((rel) => {
                res[rel.type] = rel.attributes;
            });
            return res;
        })();

        const { fileName } = relationships[
            RelationshipTypes.coverArt
        ] as MangaDexCoverArt;
        const { name } = relationships[
            RelationshipTypes.author
        ] as MangaDexAuthor;

        if (!fileName) throw new LilithError(404, "No cover found");

        const lilithTags: Tag[] = tags.map((tag) => ({
            id: tag.id,
            name: findFirstTranslatedValue(tag.attributes.name),
        }));

        const cover = {
            uri: `${tinyImgBaseUrl}/${mangaResult.data.id}/${fileName}.${imageSize}.jpg`,
        };

        return {
            id: identifier,
            title: findFirstTranslatedValue(title),
            author: name,
            chapters: chaptersResult.data
                .filter((chapter) =>
                    supportedTranslations.includes(
                        chapter.attributes.translatedLanguage,
                    ),
                )
                .map((chapter) => ({
                    id: chapter.id,
                    title: chapter.attributes.title,
                    /// It is safe to find as we filter out the non supported
                    language:
                        reverseLanguageMapper[
                            chapter.attributes.translatedLanguage
                        ],

                    chapterNumber: +chapter.attributes.chapter,
                })),
            cover,
            tags: lilithTags,
            availableLanguages:
                mangaResult.data.attributes.availableTranslatedLanguages
                    .filter((lang) => supportedTranslations.includes(lang))
                    .map((lang) => reverseLanguageMapper[lang]),
        };
    };

    const search = async (
        query: string,
        options?: Partial<SearchQueryOptions>,
    ): Promise<SearchResult> => {
        const innerOptions: Partial<SearchQueryOptions> = {
            requiredLanguages: Object.values(LilithLanguage),
            ...options,
        };

        const languageParams: UrlParamPair[] =
            innerOptions.requiredLanguages.map((lang) => [
                "availableTranslatedLanguage[]",
                lang,
            ]);

        const response = await request<MangadexResult<MangaDexBook[]>>(
            `${apiUrl}/manga`,
            [
                ["title", query],
                ["includes[]", RelationshipTypes.coverArt],
                ...languageParams,
            ],
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No search results");
        }

        const result = await response.json();

        const makeCover = (book: MangaDexBook) => {
            const mangaId = book.id;
            const coverRelationship: MangaDexRelationship<MangaDexCoverArt> =
                book.relationships.find(
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

            return `${tinyImgBaseUrl}/${mangaId}/${coverFilename}.${imageSize}.jpg`; // Specifies the size (256|512)
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
                    (lang) => reverseLanguageMapper[lang],
                );

                return {
                    id: manga.id,
                    cover: {
                        uri: makeCover(manga),
                        width: 256,
                        height: 512,
                    },
                    title: manga.attributes.title.en,
                    availableLanguages: [...new Set(availableLanguages)],
                };
            }),
        };
    };

    const randomBook = async (retry: number = 0): Promise<Book> => {
        try {
            const response = await request<MangadexResult<MangaDexBook>>(
                `${apiUrl}/random`,
            );
            const result = await response.json();
            return await getBook(result.data.id);
        } catch (error) {
            if (retry >= 3) {
                throw new LilithError(404, "Could not fetch a random book.");
            }
            randomBook(retry + 1);
        }
    };
    return {
        domains: { baseUrl, imgBaseUrl, apiUrl, tinyImgBaseUrl },
        search,
        getBook,
        getChapter,
        randomBook,
        request,
    };
};
