import {
    CloudFlareConfig,
    CustomFetch,
    CustomFetchInitOptions,
    DOMParserImpl,
    Result,
} from "../interfaces";
import {
    Book,
    Chapter,
    Pagination,
    SearchResult,
    Sort,
    Thumbnail,
    Image,
    UriType,
} from "../interfaces/base";
import { NHentaiPaginateResult, NHentaiResult } from "../interfaces/nhentai";
import RepositoryBase from "./base";

class NHentai implements RepositoryBase {
    readonly BASE_URL: string = "https://nhentai.net/";
    readonly API_URL: string = "https://nhentai.net/api/";
    readonly IMAGE_BASE_URL: string = "https://i.nhentai.net/galleries/";
    readonly AVATAR_URL: string = "https://i5.nhentai.net/";
    readonly TINY_IMAGE_BASE_URL: string = this.IMAGE_BASE_URL.replace(
        "/i.",
        "/t.",
    );

    config: CloudFlareConfig | null = null;

    localFetch: CustomFetch;
    localDomParser: DOMParserImpl;

    constructor(
        config: CloudFlareConfig | null = null,
        fetchImpl: CustomFetch,
        domParserImpl: DOMParserImpl,
    ) {
        this.config = config;
        this.localFetch = fetchImpl;
        this.localDomParser = domParserImpl;
    }

    request = async <T>(
        url: string,
        params:
            | string
            | Record<string, string>
            | string[][]
            | URLSearchParams = {},
    ): Promise<Result<T>> => {
        if (!this.config) {
            throw new Error(
                "cloudflare cookie and user-agent invalid, provide a different one.",
            );
        }

        const headers = {
            "User-Agent": this.config.userAgent,
        };

        const requestOptions: CustomFetchInitOptions = {
            method: "GET",
            headers,
            credentials: "include",
        };

        const queryString = new URLSearchParams(params).toString();
        const apiUrl = `${url}?${queryString}`;

        const response = await this.localFetch(apiUrl, requestOptions);

        const getDocument = async () =>
            this.localDomParser(await response.text(), "text/html");

        return {
            json: response.json as () => Promise<T>,
            statusCode: response.status,
            getDocument,
        };
    };

    getUri(
        type: UriType,
        mediaId: string,
        mime: string,
        pageNumber?: number,
    ): string {
        if (type === "cover")
            return `${this.TINY_IMAGE_BASE_URL}/${mediaId}/cover.${mime}`;
        if (type === "thumbnail")
            return `${this.TINY_IMAGE_BASE_URL}/${mediaId}/thumb.${mime}`;
        if (type === "page" && pageNumber !== undefined)
            return `${this.IMAGE_BASE_URL}/${mediaId}/${pageNumber}.${mime}`;
        throw new Error("Invalid type or missing page number.");
    }

    async get(identifier: string): Promise<Book | null> {
        const response = await this.request<NHentaiResult>(
            `${this.API_URL}/gallery/${identifier}`,
        );
        if (response && response.statusCode === 200) {
            const book = await response.json();
            const chapter: Chapter = {
                id: `defaultId`,
                pages: book.images.pages.map((page, index) => ({
                    uri: this.getUri(
                        "page",
                        book.media_id,
                        book.images.thumbnail.t,
                        index + 1,
                    ),
                    width: page.w,
                    height: page.h,
                })),
            };
            const Book: Book = {
                title: {
                    english: book.title.english,
                    japanese: book.title.japanese,
                    other: book.title.pretty,
                },
                id: `${book.id}`,
                authors: book.tags
                    .filter((tag) => tag.type === "artist")
                    .map((tag) => tag.name),
                genres: book.tags
                    .filter((tag) => tag.type === "tag")
                    .map((tag) => ({
                        id: `${tag.id}`,
                        name: tag.name,
                    })),
                thumbnail: {
                    uri: this.getUri(
                        "thumbnail",
                        book.media_id,
                        book.images.thumbnail.t,
                    ),
                    width: book.images.thumbnail.w,
                    height: book.images.thumbnail.h,
                },
                cover: {
                    uri: this.getUri(
                        "cover",
                        book.media_id,
                        book.images.thumbnail.t,
                    ),
                    width: book.images.cover.w,
                    height: book.images.cover.h,
                },
                chapters: [chapter],
            };
            return Book;
        }
        return null;
    }

    async search(
        query: string,
        page: number,
        sort: Sort = Sort.RECENT,
    ): Promise<SearchResult> {
        const response = await this.request(
            `${this.BASE_URL}/search?q=${query}&sort=${sort}&page=${page}`,
        );

        const document = await response.getDocument();

        const emptyResponse: SearchResult = {
            query: query,
            totalPages: 1,
            page: 1,
            totalResults: 1,
            results: [],
        };

        const container = document.querySelector("div.container");

        if (!container) return emptyResponse;

        const lastPageAnchor: HTMLAnchorElement = document.querySelector(
            "section.pagination a.last",
        );

        const totalPages =
            +new URL(lastPageAnchor.href).searchParams.get("page") || 1;

        const searchResults: HTMLAnchorElement[] = Array.from(
            container.querySelectorAll("div.gallery > a"),
        );

        if (!searchResults || searchResults.length === 0) return emptyResponse;

        const thumbnails: Thumbnail[] = searchResults.map((gallery) => {
            const bookId = gallery.href.split("/").find((p) => p.length > 5); // A code should never be less than 6 digits
            const resultCover = gallery.querySelector("img");
            const cover: Image = {
                uri: (resultCover && resultCover["data-src"]) || "",
                width: resultCover?.width || 0,
                height: resultCover?.height || 0,
            };
            const title: string =
                gallery.querySelector("div")?.textContent || "";

            return {
                id: bookId,
                cover: cover,
                title: title,
            };
        });

        return {
            query: query,
            totalPages,
            page: page,
            totalResults: 25 * totalPages,
            results: thumbnails,
        };
    }

    async paginate(page: number): Promise<Pagination> {
        const response = await this.request<NHentaiPaginateResult>(
            `${this.API_URL}/galleries/all?page=${page}`,
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
                uri: this.getUri("cover", result.media_id, cover.t),
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
    }

    async random(retry: number = 0): Promise<Book> {
        const response = await this.request(`${this.BASE_URL}/random`);

        const document = await response.getDocument();

        const idElement = document.querySelector("h3#gallery_id");
        if (!idElement || !idElement.textContent) {
            throw new Error("Could not find ID element in the response.");
        }

        const id = idElement.textContent.replace("#", "");
        const book = (await this.get(id)) || null;

        if (!book) {
            if (retry === 4) {
                throw new Error("Could not fetch a random book.");
            }
            return this.random(retry + 1);
        }

        return book;
    }
}

export default NHentai;
