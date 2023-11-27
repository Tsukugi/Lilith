import { UseDomParser } from "../../../interfaces/domParser";
import { CustomFetch, LilithHeaders } from "../../../interfaces/fetch";

/**
 * Type alias for a function that retrieves information about a chapter based on its identifier.
 * @param {string} identifier - The unique identifier of the chapter.
 * @returns {Promise<Chapter>} - A Promise that resolves to the retrieved chapter.
 */
export type GetChapter = (identifier: string) => Promise<Chapter>;

/**
 * Type alias for a function that retrieves information about a book based on its identifier.
 * @param {string} identifier - The unique identifier of the book.
 * @param {LilithLanguage[]} [requiredLanguages] - Optional array of required languages.
 * @returns {Promise<Book>} - A Promise that resolves to the retrieved book.
 */
export type GetBook = (identifier: string) => Promise<Book>;

/**
 * Type alias for a function that performs a search based on a query and optional search options.
 * @param {string} query - The search query value.
 * @param {Partial<SearchQueryOptions>} [options] - Optional search query options.
 * @returns {Promise<SearchResult>} - A Promise that resolves to the search results.
 */
export type Search = (
    query: string,
    options?: Partial<SearchQueryOptions>,
) => Promise<SearchResult>;

/**
 * Type alias for a function that retrieves a random book.
 * @param {number} [retry] - Optional retry parameter.
 * @returns {Promise<Book>} - A Promise that resolves to the retrieved random book.
 */
export type GetRandomBook = (retry?: number) => Promise<Book>;

/**
 * Type alias for a function that retrieves the latest books based on a page number.
 * @param {number} page - The page number for the latest books.
 * @returns {Promise<Pagination>} - A Promise that resolves to the latest books and pagination information.
 */
export type GetLatestBooks = (page: number) => Promise<Pagination>;

/**
 * Type alias for a function that retrieves the trending books.
 * @returns {Promise<BookBase[]>} - A Promise that resolves to the trending books.
 */
export type GetTrendingBooks = () => Promise<BookBase[]>;

/**
 * Interface representing the base methods for a repository that interacts with book-related data.
 */
export interface RepositoryBase {
    /**
     * Retrieves a chapter based on its identifier.
     * @param {string} identifier - The unique identifier of the chapter.
     * @returns {Promise<Chapter>} - A Promise that resolves to the retrieved chapter.
     */
    getChapter: GetChapter;

    /**
     * Retrieves a book based on its identifier and optional required languages.
     * @param {string} identifier - The unique identifier of the book.
     * @param {LilithLanguage[]} [requiredLanguages] - Optional array of required languages.
     * @returns {Promise<Book>} - A Promise that resolves to the retrieved book.
     */
    getBook: GetBook;

    /**
     * Searches for books based on a query and optional search options.
     * @param {string} query - The search query.
     * @param {Partial<SearchQueryOptions>} [options] - Optional search query options.
     * @returns {Promise<SearchResult>} - A Promise that resolves to the search result.
     */
    search: Search;

    /**
     * Retrieves a random book.
     * @param {number} [retry] - Optional parameter to specify the number of retry attempts.
     * @returns {Promise<Book>} - A Promise that resolves to the randomly retrieved book.
     */
    getRandomBook: GetRandomBook;

    /**
     * Retrieves the latest books based on the specified page.
     * @param {number} page - The page number.
     * @returns {Promise<Pagination>} - A Promise that resolves to the information for the latest books.
     */
    getLatestBooks: GetLatestBooks;

    /**
     * Retrieves a list of trending books.
     * @returns {Promise<BookBase[]>} - A Promise that resolves to the list of trending books.
     */
    getTrendingBooks: GetTrendingBooks;
}

/**
 * Interface representing the properties required for creating a repository with base methods.
 */
export interface RepositoryBaseProps {
    /**
     * The headers to be included in the HTTP requests.
     */
    headers?: Partial<LilithHeaders>;

    /**
     * The custom fetch function used to make HTTP requests.
     */
    fetch: CustomFetch;

    /**
     * The DOM parser function used for parsing HTML content.
     */
    domParser: UseDomParser;

    options: RepositoryBaseOptions;
}

export interface RepositoryBaseOptions {
    requiredLanguages: LilithLanguage[];
    /**
     * Optional flag indicating whether debugging information should be enabled.
     */
    debug: boolean;
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

export interface LilithImage {
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
    pages: LilithImage[];
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
    cover: LilithImage;
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
    requiredTags?: Tag[]; // TODO: To be implemented
    size?: number; // Should default to MaxSize
    page: number;
    sort: Sort; // To be deprecated
}
