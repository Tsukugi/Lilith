/* eslint-disable @typescript-eslint/no-unused-vars */
import { CustomFetchInitOptions, Result } from "../interfaces/fetch";
import {
    Book,
    SearchResult,
    RepositoryTemplate,
    Chapter,
    LilithError,
} from "../interfaces/base";
import {
    MangaDexAuthor,
    MangaDexBook,
    MangaDexCoverArt,
    MangaDexImageListResult,
    MangaDexLanguage,
    MangaDexRelationship,
    MangadexResult,
} from "../interfaces/repositories/mangadex";
import { useLilithLog } from "./log";

enum RelationshipTypes {
    coverArt = "cover_art",
    author = "author",
    manga = "manga",
    tag = "tag",
}

const imageSize: "256" | "512" = "512";

const supportedLocales: MangaDexLanguage[] = ["es", "en", "es-la"];
const getTranslatedValue = (locales: Record<MangaDexLanguage, string>) => {
    const key: string = Object.keys(locales).find((key: MangaDexLanguage) =>
        supportedLocales.includes(key),
    );
    return locales[key];
};

/*
 * MangaDex API docs https://api.mangadex.org/docs/swagger.html
 * @param props
 * @returns
 */
export const useMangaDexRepository: RepositoryTemplate = ({
    fetch,
    domParser,
    debug = false,
}) => {
    const baseUrl = "https://mangadex.org";
    const apiUrl = "https://api.mangadex.org";

    const imgBaseUrl = "https://uploads.mangadex.org/data";
    const tinyImgBaseUrl = "https://uploads.mangadex.org/covers";

    const request = async <T>(
        url: string,
        params: string = "",
    ): Promise<Result<T>> => {
        try {
            const requestOptions: Partial<CustomFetchInitOptions> = {
                method: "GET",
            };

            const apiUrl = params ? `${url}?${params}` : url;
            useLilithLog(debug).log(apiUrl);

            const response = await fetch(apiUrl, requestOptions);

            const getDocument = async () => domParser(await response.text());

            return {
                json: response.json,
                statusCode: response.status,
                getDocument,
            };
        } catch (error) {
            throw new LilithError(
                error.status || 500,
                "There was an error on the request",
                error,
            );
        }
    };

    const getChapter = async (identifier: string): Promise<Chapter | null> => {
        const response = await request<MangaDexImageListResult>(
            `${apiUrl}/at-home/server/${identifier}`,
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No chapter found");
        }

        const imagesResult = await response.json();

        return {
            id: identifier,
            pages: imagesResult.chapter.data.map((filename) => ({
                uri: `${imgBaseUrl}/${imagesResult.chapter.hash}/${filename}`,
            })),
        };
    };

    const getBook = async (identifier: string): Promise<Book | null> => {
        const manga = await request<MangadexResult<MangaDexBook>>(
            `${apiUrl}/manga/${identifier}`,
            `includes[]=${RelationshipTypes.coverArt}&includes[]=${RelationshipTypes.author}`,
        );

        if (!manga || manga?.statusCode !== 200) {
            throw new LilithError(manga?.statusCode, "No manga found");
        }

        const feed = await request<MangadexResult<MangaDexBook[]>>(
            `${apiUrl}/manga/${identifier}/feed`,
            `order[chapter]=asc`,
        );

        if (!feed || feed?.statusCode !== 200) {
            throw new LilithError(feed?.statusCode, "No manga feed found");
        }

        const mangaResult = await manga.json();
        const chaptersResult = await feed.json();

        const relationships: Record<string, unknown> = (() => {
            const res = {};
            mangaResult.data.relationships.forEach((rel) => {
                console.log(rel);
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

        const { tags, title } = mangaResult.data.attributes;

        const genres = tags.map((tag) =>
            getTranslatedValue(tag.attributes.name),
        );

        const cover = {
            uri: `${tinyImgBaseUrl}/${mangaResult.data.id}/${fileName}.${imageSize}.jpg`,
        };

        return {
            id: identifier,
            title: getTranslatedValue(title),
            author: name,
            chapters: chaptersResult.data.map((chapter) => chapter.id),
            cover,
            genres,
        };
    };

    const search = async (
        query: string,
        page: number = 1,
    ): Promise<SearchResult> => {
        const response = await request<MangadexResult<MangaDexBook[]>>(
            `${apiUrl}/manga`,
            `title=${query}&includes[]=${RelationshipTypes.coverArt}`,
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
            page,
            results: result.data.map((manga) => {
                return {
                    id: manga.id,
                    cover: {
                        uri: makeCover(manga),
                        width: 256,
                        height: 512,
                    },
                    title: manga.attributes.title.en,
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
