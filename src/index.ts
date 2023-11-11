export type {
    CustomFetch,
    CustomFetchInitOptions,
    CustomFetchResponse,
    Headers,
} from "./interfaces/index";

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
} from "./parser/domParser";

export type { RepositoryBase } from "./repo/base";
export { useNHentaiRepository } from "./repo/nhentai";
