import { CloudFlareConfig, Result } from "../interfaces";
import {
    Book,
    Pagination,
    SearchResult,
    Sort,
    UriType,
} from "../interfaces/base";

interface RepositoryBase {
    readonly BASE_URL: string;
    readonly API_URL: string;
    readonly IMAGE_BASE_URL: string;
    readonly AVATAR_URL: string;
    readonly TINY_IMAGE_BASE_URL: string;

    config: CloudFlareConfig | null;

    request: <T>(
        url: string,
        params: string | Record<string, string> | string[][] | URLSearchParams,
    ) => Promise<Result<T>>;

    getUri: (
        type: UriType,
        mediaId: string,
        mime: string,
        pageNumber?: number,
    ) => string;

    get: (identifier: string) => Promise<Book | null>;

    search: (query: string, page: number, sort: Sort) => Promise<SearchResult>;

    paginate: (page: number) => Promise<Pagination>;

    random: (retry: number) => Promise<Book>;
}

export default RepositoryBase;
