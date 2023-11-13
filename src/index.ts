export type {
    CustomFetch,
    CustomFetchInitOptions,
    CustomFetchResponse,
    Headers,
} from "./interfaces/fetch";

export { Extension, UriType, Sort } from "./interfaces/base";

export type {
    Image,
    Chapter,
    Genre,
    Title,
    Book,
    Thumbnail,
    SearchResult,
    Pagination,
} from "./interfaces/base";

export type {
    UseDomParser,
    UseDomParserImpl,
    ElementProps,
    ElementAttributes,
} from "./interfaces/domParser";

export type { RepositoryBase } from "./interfaces/base";
export { useNHentaiRepository } from "./repo/nhentai";
export { useCheerioDomParser } from "./impl/useCheerioDomParser";
export { useNodeFetch } from "./impl/useNodeFetch";

export { useAPILoader, UseAPILoaderProps } from "./api/loader";
