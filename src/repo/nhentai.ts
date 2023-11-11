import { CustomFetchInitOptions, Result } from "../interfaces/fetch";
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
    Genre,
    RepositoryTemplate,
} from "../interfaces/base";
import { NHentaiPaginateResult, NHentaiResult } from "../interfaces/nhentai";
import { UseDomParserImpl } from "../interfaces/domParser";

export const useNHentaiRepository: RepositoryTemplate = ({
    fetch,
    domParser,
    headers,
}) => {
    const baseUrl = "https://nhentai.net/";
    const apiUrl = "https://nhentai.net/api/";
    const imgBaseUrl = "https://i.nhentai.net/galleries/";
    const avatarUrl = "https://i5.nhentai.net/";
    const tinyImgBaseUrl = imgBaseUrl.replace("/i.", "/t.");

    const request = async <T>(
        url: string,
        params:
            | string
            | Record<string, string>
            | string[][]
            | URLSearchParams = {},
    ): Promise<Result<T>> => {
        if (!headers) {
            throw new Error(
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

        const queryString = new URLSearchParams(params).toString();
        const apiUrl = `${url}?${queryString}`;

        const response = await fetch(apiUrl, requestOptions);

        const getDocument = async () => domParser(await response.text());

        return {
            json: response.json,
            statusCode: response.status,
            getDocument,
        };
    };

    const getUri = (
        type: UriType,
        mediaId: string,
        mime: Extension,
        pageNumber?: number,
    ): string => {
        if (type === "cover")
            return `${tinyImgBaseUrl}${mediaId}/cover.${mime}`;
        if (type === "thumbnail")
            return `${tinyImgBaseUrl}${mediaId}/thumb.${mime}`;
        if (type === "page" && pageNumber !== undefined)
            return `${imgBaseUrl}${mediaId}/${pageNumber}.${mime}`;
        throw new Error("Invalid type or missing page number.");
    };

    const get = async (identifier: string): Promise<Book | null> => {
        const response = await request<NHentaiResult>(
            `${apiUrl}/gallery/${identifier}`,
        );

        if (!response || response?.statusCode !== 200) return null;

        const book = await response.json();
        const chapter: Chapter = {
            id: `${book.id}`,
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
        };

        const { english, japanese, pretty } = book.title;

        const authors: string[] = [];
        const genres: Genre[] = [];

        book.tags.forEach((tag) => {
            if (tag.type === "artist") {
                authors.push(tag.name);
            }
            if (tag.type === "tag") {
                genres.push({
                    id: `${tag.id}`,
                    name: tag.name,
                });
            }
        });

        const thumbnailExtension = Extension[book.images.thumbnail.t];
        const coverExtension = Extension[book.images.cover.t];

        const Book: Book = {
            title: {
                english,
                japanese,
                other: pretty,
            },
            id: `${book.id}`,
            authors,
            genres,
            thumbnail: {
                uri: getUri("thumbnail", book.media_id, thumbnailExtension),
                width: book.images.thumbnail.w,
                height: book.images.thumbnail.h,
            },
            cover: {
                uri: getUri("cover", book.media_id, coverExtension),
                width: book.images.cover.w,
                height: book.images.cover.h,
            },
            chapters: [chapter],
        };
        return Book;
    };

    const search = async (
        query: string,
        page: number,
        sort: Sort = Sort.RECENT,
    ): Promise<SearchResult> => {
        const response = await request(
            `${baseUrl}/search?q=${query}&sort=${sort}&page=${page}`,
        );

        const document = await response.getDocument();

        const emptyResponse: SearchResult = {
            query: query,
            totalPages: 1,
            page: 1,
            totalResults: 1,
            results: [],
        };

        const container = document.find("div.container");
        if (!container) return emptyResponse;

        const lastPageAnchor = document
            .find("section.pagination a.last")
            .getElement();

        const { href } = lastPageAnchor.attributes;

        const pageNumberRegex = /page=(\d+)/;
        const match = href.match(pageNumberRegex);

        const totalPages = match ? +match[1] : 1;

        const searchResults: UseDomParserImpl[] =
            container.findAll("div.gallery > a");

        if (!searchResults || searchResults.length === 0) return emptyResponse;

        const thumbnails: Thumbnail[] = searchResults.map((searchElement) => {
            const { href } = searchElement.getElement().attributes;

            const bookId = href.split("/").find((p) => p.length > 5); // A code should never be less than 6 digits

            const resultCover = searchElement.find("img").getElement();
            const { width, height, src } = resultCover.attributes;

            const cover: Image = {
                uri: resultCover.attributes?.["data-src"] || src || "",
                width: width || 0,
                height: height || 0,
            };

            const resultTitle = searchElement.find(".caption")?.getElement();

            const title: string = resultTitle?.textContent || "";

            return {
                id: bookId,
                cover: cover,
                title,
            };
        });

        return {
            query: query,
            totalPages,
            page: page,
            totalResults: 25 * totalPages,
            results: thumbnails,
        };
    };

    const paginate = async (page: number): Promise<Pagination> => {
        const response = await request<NHentaiPaginateResult>(
            `${apiUrl}/galleries/all?page=${page}`,
        );

        if (response.statusCode !== 200) {
            return {
                page,
                totalResults: 0,
                totalPages: 0,
                results: [],
            };
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

    const random = async (retry: number = 0): Promise<Book> => {
        const response = await request(`${baseUrl}/random`);

        const document = await response.getDocument();

        const idElement = document.find("h3#gallery_id").getElement();

        if (!idElement || !idElement.textContent) {
            throw new Error("Could not find ID element in the response.");
        }

        const id = idElement.textContent.replace("#", "");
        const book = (await get(id)) || null;

        if (!book) {
            if (retry === 4) {
                throw new Error("Could not fetch a random book.");
            }
            return random(retry + 1);
        }

        return book;
    };

    return {
        domains: { baseUrl, imgBaseUrl, apiUrl, avatarUrl, tinyImgBaseUrl },
        get,
        getUri,
        search,
        paginate,
        random,
        request,
    };
};
