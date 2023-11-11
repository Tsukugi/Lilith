export type {
    LilithRepo,
    CustomFetch,
    CustomFetchInitOptions,
    CustomFetchResponse,
    CloudFlareConfig,
} from "./interfaces/index";

export type {
    UriType,
    Sort,
    Image,
    Chapter,
    Genre,
    Title,
    Book,
    Thumbnail,
    SearchResult,
    Pagination,
    Extension,
} from "./interfaces/base";

export type {
    UseDomParser,
    UseDomParserImpl,
    ElementProps,
    ElementAttributes,
} from "./parser/domParser";

export type { RepositoryBase } from "./repo/base";
export { useNHentaiRepository } from "./repo/nhentai";
