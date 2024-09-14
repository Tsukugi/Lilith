export type {
    CustomFetch,
    CustomFetchInitOptions,
    CustomFetchResponse,
    LilithHeaders,
    UrlParamPair,
    UrlParamValue,
} from "./interfaces/fetch";

export type {
    ImageExtension,
    ImageUriType,
    Sort,
    LilithLanguage,
} from "./repo/base/interfaces";

export type {
    LilithImage,
    LilithTag,
    Book,
    BookBase,
    Chapter,
    ChapterBase,
    Search,
    SearchResult,
    SearchQueryOptions,
    BookListResults,
    Domains,
    RepositoryBaseProps,
    RepositoryTemplate,
    RepositoryBase,
    GetBook,
    GetChapter,
    GetRandomBook,
    GetLatestBooks,
    GetTrendingBooks,
} from "./repo/base/interfaces";

export type { UseDomParser, UseDomParserImpl } from "./interfaces/domParser";

export { LilithError } from "./repo/base";

export type { UseAPILoaderProps, APILoaderConfigurations } from "./api/loader";

export { LilithRepo } from "./interfaces";
