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
    LilithError,
} from "../interfaces/base";
import {
    NHentaiPaginateResult,
    NHentaiResult,
} from "../interfaces/repositories/nhentai";
import { UseDomParserImpl } from "../interfaces/domParser";

export const useNHentaiRepository: RepositoryTemplate = ({
    fetch,
    domParser,
    headers,
}) => {
    const baseUrl = "https://nhentai.net/";
    const apiUrl = "https://nhentai.net/api/";
    const imgBaseUrl = "https://i.nhentai.net/galleries/";
    const tinyImgBaseUrl = imgBaseUrl.replace("/i.", "/t.");

    const request = async <T>(
        url: string,
        params: Record<string, string> = {},
    ): Promise<Result<T>> => {
        if (!headers) {
            throw new LilithError(
                403,
                "cloudflare cookie and user-agent invalid, provide a different one.",
            );
        }
        try {
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
        } catch (error) {
            throw new LilithError(
                error.status || 500,
                "There was an error on the request",
                error,
            );
        }
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
        };
    };

    const getBook = async (id: string): Promise<Book> => {
        const response = await request<NHentaiResult>(
            `${apiUrl}/gallery/${id}`,
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No book found");
        }

        const book = await response.json();

        const genres: Genre[] = [];
        book.tags.forEach((tag) => {
            if (tag.type === "tag") {
                genres.push({
                    id: `${tag.id}`,
                    name: tag.name,
                });
            }
        });

        const { english, japanese, pretty } = book.title;

        const Book: Book = {
            title: english || japanese || pretty,
            id: `${book.id}`,
            author: book.tags.find((tag) => tag.type === "artist").name,
            genres,
            cover: {
                uri: getUri(
                    "cover",
                    book.media_id,
                    Extension[book.images.cover.t],
                ),
                width: book.images.cover.w,
                height: book.images.cover.h,
            },
            chapters: [`${book.id}`],
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

        const container = document.find("div.container");
        if (!container) {
            throw new LilithError(404, "No container found");
        }

        const lastPageAnchor = document
            .find("section.pagination a.last")
            .getElement();

        const { href } = lastPageAnchor.attributes;

        const pageNumberRegex = /page=(\d+)/;
        const match = href.match(pageNumberRegex);

        const totalPages = match ? +match[1] : 1;

        const searchResults: UseDomParserImpl[] =
            container.findAll("div.gallery > a");

        if (!searchResults || searchResults.length === 0) {
            throw new LilithError(404, "No search results found");
        }

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

        const idElement = document.find("h3#gallery_id").getElement();

        if (!idElement || !idElement.textContent) {
            throw new LilithError(
                404,
                "Could not find ID element in the response.",
            );
        }

        const id = idElement.textContent.replace("#", "");
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
