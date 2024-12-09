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
 * @param {Partial<GetBookOptions>} [options] - Optional GetBook options.
 * @returns {Promise<Book>} - A Promise that resolves to the retrieved book.
 */
export type GetBook = (
    identifier: string,
    options?: Partial<GetBookOptions>,
) => Promise<Book>;

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
 * @returns {Promise<BookListResults>} - A Promise that resolves to the latest books and pagination information.
 */
export type GetLatestBooks = (page: number) => Promise<BookListResults>;

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
     * @returns {Promise<BookListResults>} - A Promise that resolves to the information for the latest books.
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

    /**
     * Options for configuring the repository base.
     */
    options: RepositoryBaseOptions;
}

/**
 * Options for configuring the repository base.
 */
export interface RepositoryBaseOptions {
    /**
     * An array of required languages for the repository.
     */
    requiredLanguages: LilithLanguage[];

    /**
     * Optional flag indicating whether debugging information should be enabled.
     */
    debug: boolean;
}

/**
 * Type representing a function to create a repository template.
 * All Lilith Repositories must be of this type to be able to be used in the API Loader.
 */
export type RepositoryTemplate = (props: RepositoryBaseProps) => RepositoryBase;

/**
 * Type representing different types of image URIs.
 */
export type ImageUriType = "cover" | "page" | "thumbnail";

/**
 * Enum representing Lilith supported languages.
 */
export enum LilithLanguage {
    english = "en",
    japanese = "jp",
    spanish = "es",
    mandarin = "zh",
}

/**
 * Lilith image file extensions supported.
 */
export enum LilithImageExtension {
    jpg = "jpg",
    jpeg = "jpeg",
    png = "png",
}

/**
 * Enum representing sorting options for Search.
 */
export enum Sort {
    Latest = "Latest",
    Popular = "Popular",
    PopularAllTime = "PopularAllTime",
}

/**
 * Interface representing an image with URI and optional dimensions.
 */
export interface LilithImage {
    uri: string;
    width?: number;
    height?: number;
}

/**
 * Interface representing the base properties of a chapter.
 */
export interface Chapter {
    id: string;
    title: string;
    language: LilithLanguage;
    chapterNumber: number;
    pages: LilithImage[];
}

/**
 * Interface representing a tag with ID and name.
 */
export interface LilithTag {
    id: string;
    name: string;
}

/**
 * Interface representing the base properties of a book.
 */
export interface BookBase {
    id: string;
    cover: LilithImage;
    title: string;
    availableLanguages: LilithLanguage[];
}

/**
 * Interface representing a book with additional properties.
 */
export interface Book extends BookBase {
    author: string;
    tags: LilithTag[];
    chapters: Chapter[];
}

/**
 * Interface representing search results with query information.
 */
export interface SearchResult extends BookListResults {
    query: string;
}

/**
 * Interface representing a list of book results with pagination information.
 */
export interface BookListResults {
    results: BookBase[];
    page: number;
    totalResults?: number; // To be deprecated
    totalPages?: number; // To be deprecated
}

/**
 * Interface representing URLs for different domains.
 */
export interface Domains {
    readonly baseUrl: string;
    readonly apiUrl: string;
    readonly imgBaseUrl: string;
    readonly tinyImgBaseUrl: string;
}

/**
 * Interface representing options for a search query.
 */
export interface SearchQueryOptions {
    requiredTags?: LilithTag[]; // TODO: To be implemented
    size: number;
    page: number;
    sort: Sort;
}

/**
 * Interface representing options for a getBook query.
 */
export interface GetBookOptions {
    chapterList?: Partial<ChapterListOptions>;
}
interface ChapterListOptions {
    /**
     * EachRepo should provide some default value that respects it's API.
     * Should be a high amount that is reasonable for a single request (e.g 25 - 100)
     */
    size: number;
    page: number;
    orderBy: "asc" | "desc";
}
