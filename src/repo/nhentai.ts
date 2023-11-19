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
    Sort,
    Thumbnail,
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
    NHentaiPaginateResult,
    NHentaiResult,
    NHentaiTag,
} from "../interfaces/repositories/nhentai";
import { UseDomParserImpl } from "../interfaces/domParser";
import { useRequest } from "./utils/request";

const parseTags = (tags: NHentaiTag[]): Record<string, NHentaiTag[]> => {
    const res = {} as Record<string, NHentaiTag[]>;
    tags.forEach((tag) => {
        res[tag.type] = [...(res[tag.type] || []), tag];
    });
    return res;
};

const LanguageMapper: Record<string, LilithLanguage> = {
    english: LilithLanguage.english,
    japanese: LilithLanguage.japanese,
    spanish: LilithLanguage.spanish,
    mandarin: LilithLanguage.mandarin,
    chinese: LilithLanguage.mandarin,
};

const getLanguageFromTags = (tags: NHentaiTag[]): string => {
    const tagDict = parseTags(tags);
    const languageTag = tagDict.language || [{ name: "unknown" } as NHentaiTag];
    return languageTag[0].name; // If there are multiple (shouldn't be the case) pick the first match
};

export const useNHentaiRepository: RepositoryTemplate = (props) => {
    const { headers } = props;
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

        const lilithLanguage = LanguageMapper[getLanguageFromTags(book.tags)];

        const matchesTranslation = requiredLanguages.includes(lilithLanguage);
        if (!matchesTranslation) {
            throw new LilithError(
                404,
                "No translation for the requested language available",
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
                },
            ],
        };
        return Book;
    };

    const search = async (
        query: string,
        options?: Partial<SearchQueryOptions>,
    ): Promise<SearchResult> => {
        const innerOptions: Partial<SearchQueryOptions> = {
            page: 1,
            sort: Sort.RECENT,
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
            container.findAll("div.gallery > a");

        if (!searchResults || searchResults.length === 0) {
            throw new LilithError(404, "No search results found");
        }

        const thumbnails: Thumbnail[] = searchResults.map((searchElement) => {
            const bookId = searchElement

                .getAttribute("href")
                .split("/")
                .find((p) => p.length > 5); // A code should never be less than 6 digits

            const resultCover = searchElement.find("img");

            const { getAttribute } = resultCover;
            const cover: Image = {
                uri: getAttribute("data-src") || getAttribute("src") || "",
                width: +getAttribute("width") || 0,
                height: +getAttribute("height") || 0,
            };

            const title: string =
                searchElement.find(".caption")?.getText() || "";

            return {
                id: bookId,
                cover: cover,
                title,
            };
        });

        return {
            query: query,
            totalPages,
            page: innerOptions.page,
            totalResults: 25 * totalPages,
            results: thumbnails,
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

        const thumbnails: Thumbnail[] = (data.result || []).map((result) => {
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
            };
        });

        return {
            page,
            totalResults,
            totalPages: numPages,
            results: thumbnails,
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
