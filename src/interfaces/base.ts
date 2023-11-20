import { Headers, CustomFetch, Result, UrlParamPair } from "./fetch";
import { UseDomParser } from "./domParser";

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
    page: number;
    totalResults: number;
    totalPages: number;
    results: BookBase[];
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

export interface RepositoryBase {
    domains: Domains;

    request: <T>(url: string, params?: UrlParamPair[]) => Promise<Result<T>>;

    getChapter: (identifier: string) => Promise<Chapter>;

    getBook: (
        identifier: string,
        requiredLanguages?: LilithLanguage[],
    ) => Promise<Book>;

    search: (
        query: string,
        options?: Partial<SearchQueryOptions>,
    ) => Promise<SearchResult>;

    randomBook: (retry?: number) => Promise<Book>;

    paginate?: (page: number) => Promise<Pagination>;
}

export interface RepositoryBaseProps {
    headers: Headers;
    fetch: CustomFetch;
    domParser: UseDomParser;
    debug?: boolean;
}

export type RepositoryTemplate = (props: RepositoryBaseProps) => RepositoryBase;

export class LilithError {
    status: number;
    message: string;
    data?: unknown;

    constructor(status: number, message: string, data?: unknown) {
        this.data = data;
        this.status = status;
        this.message = message;
    }
}
