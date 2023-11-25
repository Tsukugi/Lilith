import { Headers, CustomFetch } from "./fetch";
import { UseDomParser } from "./domParser";

/**
 * Interface representing the base methods for a repository that interacts with book-related data.
 */
export interface RepositoryBase {
    /**
     * Retrieves a chapter based on its identifier.
     * @param {string} identifier - The unique identifier of the chapter.
     * @returns {Promise<Chapter>} - A Promise that resolves to the retrieved chapter.
     */
    getChapter: (identifier: string) => Promise<Chapter>;

    /**
     * Retrieves a book based on its identifier and optional required languages.
     * @param {string} identifier - The unique identifier of the book.
     * @param {LilithLanguage[]} [requiredLanguages] - Optional array of required languages.
     * @returns {Promise<Book>} - A Promise that resolves to the retrieved book.
     */
    getBook: (
        identifier: string,
        requiredLanguages?: LilithLanguage[],
    ) => Promise<Book>;

    /**
     * Searches for books based on a query and optional search options.
     * @param {string} query - The search query.
     * @param {Partial<SearchQueryOptions>} [options] - Optional search query options.
     * @returns {Promise<SearchResult>} - A Promise that resolves to the search result.
     */
    search: (
        query: string,
        options?: Partial<SearchQueryOptions>,
    ) => Promise<SearchResult>;

    /**
     * Retrieves a random book.
     * @param {number} [retry] - Optional parameter to specify the number of retry attempts.
     * @returns {Promise<Book>} - A Promise that resolves to the randomly retrieved book.
     */
    getRandomBook: (retry?: number) => Promise<Book>;

    /**
     * Retrieves the latest books based on the specified page.
     * @param {number} page - The page number.
     * @returns {Promise<Pagination>} - A Promise that resolves to the information for the latest books.
     */
    getLatestBooks?: (page: number) => Promise<Pagination>;

    /**
     * Retrieves a list of trending books.
     * @returns {Promise<BookBase[]>} - A Promise that resolves to the list of trending books.
     */
    getTrendingBooks?: () => Promise<BookBase[]>;
}

/**
 * Interface representing the properties required for creating a repository with base methods.
 */
export interface RepositoryBaseProps {
    /**
     * The headers to be included in the HTTP requests.
     */
    headers: Headers;

    /**
     * The custom fetch function used to make HTTP requests.
     */
    fetch: CustomFetch;

    /**
     * The DOM parser function used for parsing HTML content.
     */
    domParser: UseDomParser;

    /**
     * Optional flag indicating whether debugging information should be enabled.
     */
    debug?: boolean;
}

export type RepositoryTemplate = (props: RepositoryBaseProps) => RepositoryBase;

export type UriType = "cover" | "page" | "thumbnail";

export enum LilithLanguage {
    english = "en",
    japanese = "jp",
    spanish = "es",
    mandarin = "zh",
}

export enum Extension {
    j = "jpg",
    p = "png",
    g = "gif",
}

export enum Sort {
    RECENT = "recent",
    POPULAR_TODAY = "popular-today",
    POPULAR_WEEK = "popular-week",
    POPULAR = "popular",
}

export interface Image {
    uri: string;
    width?: number;
    height?: number;
}

export interface ChapterBase {
    id: string;
    title: string;
    language: LilithLanguage;
    chapterNumber: number;
}
export interface Chapter extends ChapterBase {
    pages: Image[];
}

export interface Tag {
    id: string;
    name: string;
}

export interface Title {
    english: string;
    japanese: string;
    other: string;
}

export interface BookBase {
    id: string;
    cover: Image;
    title: string;
    availableLanguages: LilithLanguage[];
}

export interface Book extends BookBase {
    author: string;
    tags: Tag[];
    chapters: ChapterBase[];
}

export interface SearchResult {
    query: string;
    page: number;
    results: BookBase[];
    totalResults?: number; // To be deprecated
    totalPages?: number; // To be deprecated
}

export interface Pagination {
    results: BookBase[];
    page: number;
    totalResults?: number; // To be deprecated
    totalPages?: number; // To be deprecated
}

export interface Domains {
    readonly baseUrl: string;
    readonly apiUrl: string;
    readonly imgBaseUrl: string;
    readonly tinyImgBaseUrl: string;
}

export interface SearchQueryOptions {
    requiredTags?: Tag[];
    requiredLanguages?: LilithLanguage[];
    size?: number; // Defaults to MaxSize
    page: number;
    sort: Sort; // To be deprecated
}
