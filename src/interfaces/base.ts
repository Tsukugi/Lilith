import { Headers, CustomFetch, Result } from "./fetch";
import { UseDomParser } from "./domParser";

export type UriType = "cover" | "page" | "thumbnail";

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

export interface Chapter {
    id: string;
    pages: Image[];
}

export interface Genre {
    id: string;
    name: string;
}

export interface Title {
    english: string;
    japanese: string;
    other: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    genres: Genre[];
    cover: Image;
    chapters: string[];
}

export interface Thumbnail {
    id: string;
    cover: Image;
    title: string;
}

export interface SearchResult {
    query: string;
    page: number;
    results: Thumbnail[];
    totalResults?: number;
    totalPages?: number;
}

export interface Pagination {
    page: number;
    totalResults: number;
    totalPages: number;
    results: Thumbnail[];
}

export interface Domains {
    readonly baseUrl: string;
    readonly apiUrl: string;
    readonly imgBaseUrl: string;
    readonly tinyImgBaseUrl: string;
}

export interface RepositoryBase {
    domains: Domains;

    request: <T>(url: string, params?: string) => Promise<Result<T>>;

    getChapter: (identifier: string) => Promise<Chapter>;

    getBook: (identifier: string) => Promise<Book>;

    search: (
        query: string,
        page?: number,
        sort?: Sort,
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
