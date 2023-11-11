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
    width: number;
    height: number;
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
    title: Title;
    id: string;
    authors: string[];
    genres: Genre[];
    thumbnail: Image;
    cover: Image;
    chapters: Chapter[];
}

export interface Thumbnail {
    id: string;
    cover: Image;
    title: string;
}

export interface SearchResult {
    query: string;
    totalPages: number;
    page: number;
    totalResults: number;
    results: Thumbnail[];
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
    readonly avatarUrl: string;
    readonly tinyImgBaseUrl: string;
}

export interface RepositoryBase {
    domains: Domains;

    request: <T>(
        url: string,
        params?: string | Record<string, string> | string[][] | URLSearchParams,
    ) => Promise<Result<T>>;

    getUri: (
        type: UriType,
        mediaId: string,
        mime: Extension,
        pageNumber?: number,
    ) => string;

    get: (identifier: string) => Promise<Book | null>;

    search: (query: string, page: number, sort: Sort) => Promise<SearchResult>;

    paginate: (page: number) => Promise<Pagination>;

    random: (retry?: number) => Promise<Book>;
}

export interface RepositoryBaseProps {
    headers: Headers;
    fetch: CustomFetch;
    domParser: UseDomParser;
}

export type RepositoryTemplate = (props: RepositoryBaseProps) => RepositoryBase;
