export type {
    CustomFetch,
    CustomFetchInitOptions,
    CustomFetchResponse,
    LilithHeaders,
    UrlParamPair,
    UrlParamValue,
} from "./interfaces/fetch";

export {
    Extension,
    UriType,
    Sort,
    LilithLanguage,
} from "./repo/base/interfaces";

export type {
    LilithImage,
    Chapter,
    Tag,
    Title,
    Book,
    BookBase,
    SearchResult,
    BookListResults,
    ChapterBase,
    Domains,
    RepositoryBaseProps,
    RepositoryTemplate,
    RepositoryBase,
} from "./repo/base/interfaces";

export type { UseDomParser, UseDomParserImpl } from "./interfaces/domParser";

export { MaxSearchSize, LilithError } from "./repo/base";

export { useNHentaiRepository } from "./repo/nhentai";
export { useMangaDexRepository } from "./repo/mangadex";

export { useCheerioDomParser } from "./impl/useCheerioDomParser";
export { useNodeFetch } from "./impl/useNodeFetch";

export { useAPILoader } from "./api/loader";
export type { UseAPILoaderProps, APILoaderConfigurations } from "./api/loader";

export { LilithRepo } from "./interfaces";
