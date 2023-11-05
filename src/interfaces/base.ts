export interface CloudFlareConfig {
    userAgent: string;
    cfClearance: string;
}

export type UriType = "cover" | "page" | "thumbnail";

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
