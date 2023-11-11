import { CloudFlareConfig, CustomFetch, Result } from "../interfaces";
import { UseDomParser } from "../parser/domParser";
import {
    Book,
    Extension,
    Pagination,
    SearchResult,
    Sort,
    UriType,
} from "../interfaces/base";

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
    headers: CloudFlareConfig;
    fetch: CustomFetch;
    domParser: UseDomParser;
}

export type RepositoryTemplate = (props: RepositoryBaseProps) => RepositoryBase;
