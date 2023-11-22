import {
    CustomFetchInitOptions,
    Result,
    UrlParamPair,
} from "../interfaces/fetch";
import {
    Book,
    Chapter,
    Pagination,
    SearchResult,
    BookBase,
    Image,
    UriType,
    Extension,
    Tag,
    RepositoryTemplate,
    LilithError,
    LilithLanguage,
    SearchQueryOptions,
} from "../interfaces/base";
import {
    NHentaiLanguage,
    NHentaiPaginateResult,
    NHentaiResult,
    NHentaiTag,
} from "../interfaces/repositories/nhentai";
import { UseDomParserImpl } from "../interfaces/domParser";
import { useRequest } from "./utils/request";
import { useLilithLog } from "./utils/log";
import { PromiseTools } from "./utils/promise";
import { DefaultSearchOptions } from "./base";
import { useRangeFinder } from "./utils/range";

const LanguageCodeMapper: Record<string, LilithLanguage> = {
    "12227": LilithLanguage.english,
    "29963": LilithLanguage.mandarin,
    "6346": LilithLanguage.japanese,
};

const LanguageMapper: Record<NHentaiLanguage, LilithLanguage> = {
    [NHentaiLanguage.english]: LilithLanguage.english,
    [NHentaiLanguage.japanese]: LilithLanguage.japanese,
    [NHentaiLanguage.chinese]: LilithLanguage.mandarin,
};

const getLanguageFromTags = (tags: NHentaiTag[]): NHentaiLanguage => {
    const filteredTag = tags.find(
        (tag) => tag.type === "language" && LanguageMapper[tag.name],
    );
    const result = filteredTag.name || NHentaiLanguage.japanese;
    return result as NHentaiLanguage;
};

const extractLanguages = (title: string): LilithLanguage[] => {
    const matches = title.toLowerCase().match(/\[(.*?)\]/g);
    const posibleLanguages = matches
        ? matches.map((match) => match.slice(1, -1))
        : [];
    const languages: LilithLanguage[] = posibleLanguages
        .filter((lang) => Object.keys(LanguageMapper).includes(lang))
        .map((lang) => LanguageMapper[lang]);

    return languages;
};

const nHentaiPageResultSize = 25; //Nhentai search pages have this size

export const useNHentaiRepository: RepositoryTemplate = (props) => {
    const { headers, debug } = props;
    const { doRequest } = useRequest(props);

    const baseUrl = "https://nhentai.net";
    const apiUrl = "https://nhentai.net/api";
    const imgBaseUrl = "https://i.nhentai.net/galleries";
    const tinyImgBaseUrl = imgBaseUrl.replace("/i.", "/t.");

    const request = async <T>(
        url: string,
        params: UrlParamPair[] = [],
    ): Promise<Result<T>> => {
        if (!headers) {
            throw new LilithError(
                403,
                "cloudflare cookie and user-agent invalid, provide a different one.",
            );
        }
        const requestOptions: CustomFetchInitOptions = {
            method: "GET",
            headers: {
                cookie: headers.cookie,
                "User-Agent": headers["User-Agent"],
            },
            credentials: "include",
        };

        return doRequest(url, params, requestOptions);
    };

    const getUri = (
        type: UriType,
        mediaId: string,
        mime: Extension,
        pageNumber?: number,
    ): string => {
        if (type === "cover")
            return `${tinyImgBaseUrl}/${mediaId}/cover.${mime}`;
        if (type === "thumbnail")
            return `${tinyImgBaseUrl}/${mediaId}/thumb.${mime}`;
        if (type === "page" && pageNumber !== undefined)
            return `${imgBaseUrl}/${mediaId}/${pageNumber}.${mime}`;
        throw new LilithError(500, "Invalid type or missing page number.");
    };

    const getChapter = async (chapterId: string): Promise<Chapter> => {
        /**
         * NHentai doesn't use chapters, it directly gets the pages from the book, as 1 chapter books
         */
        const response = await request<NHentaiResult>(
            `${apiUrl}/gallery/${chapterId}`,
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No chapter found");
        }

        const book = await response.json();

        return {
            id: chapterId,
            pages: book.images.pages.map((page, index) => ({
                uri: getUri(
                    "page",
                    book.media_id,
                    Extension[book.images.thumbnail.t],
                    index + 1,
                ),
                width: page.w,
                height: page.h,
            })),
            language: LanguageMapper[getLanguageFromTags(book.tags)],
            title:
                book.title[getLanguageFromTags(book.tags)] || book.title.pretty,
            chapterNumber: 1,
        };
    };

    const getBook = async (
        id: string,
        requiredLanguages: LilithLanguage[] = Object.values(LilithLanguage),
    ): Promise<Book> => {
        const response = await request<NHentaiResult>(
            `${apiUrl}/gallery/${id}`,
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No book found");
        }

        const book = await response.json();

        const tags: Tag[] = [];

        let author = "unknown";
        book.tags.forEach((tag) => {
            if (tag.type === "author" && author === "unknown") {
                author = tag.name; // Get the first author
            }
            if (tag.type === "tag") {
                tags.push({
                    id: `${tag.id}`,
                    name: tag.name,
                });
            }
        });

        const lilithLanguage: LilithLanguage =
            LanguageMapper[getLanguageFromTags(book.tags)];

        const matchesTranslation = requiredLanguages.includes(lilithLanguage);
        useLilithLog(debug).log({
            requiredLanguages,
            lilithLanguage,
            matchesTranslation,
            tags: book.tags.map((tag) => [tag.type, tag.name]),
        });

        if (!matchesTranslation) {
            throw new LilithError(
                404,
                `No translation for the requested language available, retrieved: ${lilithLanguage}`,
            );
        }

        const { english, japanese, pretty } = book.title;

        const Book: Book = {
            title: english || japanese || pretty,
            id: `${book.id}`,
            author,
            tags,
            cover: {
                uri: getUri(
                    "cover",
                    book.media_id,
                    Extension[book.images.cover.t],
                ),
                width: book.images.cover.w,
                height: book.images.cover.h,
            },
            //NHentai always provides 1 chapter books
            chapters: [
                {
                    id: `${book.id}`,
                    title:
                        book.title[getLanguageFromTags(book.tags)] ||
                        book.title.pretty,
                    language: lilithLanguage,
                    chapterNumber: 1,
                },
            ],
            availableLanguages: [lilithLanguage],
        };
        return Book;
    };

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

        const books: BookBase[] = searchResults.map((searchElement) => {
            const anchorElement = searchElement.find("> a");
            const bookId = anchorElement

                .getAttribute("href")
                .split("/")
                .find((p) => p.length > 5); // A code should never be less than 6 digits

            const resultCover = anchorElement.find("img");

            const { getAttribute } = resultCover;
            const cover: Image = {
                uri: getAttribute("data-src") || getAttribute("src") || "",
                width: +getAttribute("width") || 0,
                height: +getAttribute("height") || 0,
            };

            const titleElement = anchorElement.find(".caption");
            const title: string = titleElement?.getText() || "";

            let availableLanguages: LilithLanguage[] = searchElement
                .getAttribute("data-tags")
                .split(" ")
                .filter((code) =>
                    Object.keys(LanguageCodeMapper).includes(code),
                )
                .map((code) => LanguageCodeMapper[code]);

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

        return {
            query: query,
            totalPages,
            page: innerOptions.page,
            totalResults: nHentaiPageResultSize * totalPages,
            results: books,
        };
    };

    const search = async (
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

    const paginate = async (page: number): Promise<Pagination> => {
        const response = await request<NHentaiPaginateResult>(
            `${apiUrl}/galleries/all?page=${page}`,
        );

        if (response.statusCode !== 200) {
            throw new LilithError(
                response.statusCode,
                "Could not find a correct pagination",
            );
        }

        const data = await response.json();
        const numPages = data.num_pages || 0;
        const perPageEntries = data.per_page || 0;
        const totalResults = numPages * perPageEntries;

        const books: BookBase[] = (data.result || []).map((result) => {
            const cover = result.images.cover;
            const coverImage: Image = {
                uri: getUri("cover", result.media_id, Extension[cover.t]),
                width: cover.w,
                height: cover.h,
            };
            return {
                id: `${result.id}`,
                title: result.title.english,
                cover: coverImage,
                availableLanguages: [
                    LanguageMapper[getLanguageFromTags(result.tags)],
                ],
            };
        });

        return {
            page,
            totalResults,
            totalPages: numPages,
            results: books,
        };
    };

    const getRandomGeneric = async <T>(
        retry: number = 0,
        onGet: (id: string) => Promise<T>,
    ): Promise<T> => {
        const response = await request(`${baseUrl}/random`);

        const document = await response.getDocument();

        const idElement = document.find("h3#gallery_id");

        if (!idElement || !idElement.getText()) {
            throw new LilithError(
                404,
                "Could not find ID element in the response.",
            );
        }

        const id = idElement.getText().replace("#", "");
        const result = (await onGet(id)) || null;

        if (!result) {
            if (retry >= 3) {
                throw new LilithError(404, "Could not fetch a random book.");
            }
            return getRandomGeneric(retry + 1, onGet);
        }

        return result;
    };

    return {
        domains: { baseUrl, imgBaseUrl, apiUrl, tinyImgBaseUrl },
        getBook,
        getChapter,
        search,
        paginate,
        randomBook: (retry) => getRandomGeneric(retry, getBook),
        request,
    };
};
