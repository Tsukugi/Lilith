export enum MangaDexLanguage {
    EN = "en",
    KO = "ko",
    JA_RO = "ja-ro",
    ES = "es",
    ES_LA = "es-la",
    JA = "ja",
    ZH = "zh",
    KO_RO = "ko-ro",
    ZH_HK = "zh-hk",
    ZH_RO = "zh-ro",
    DE = "de",
    PT_BR = "pt-br",
    EL = "el",
    ID = "id",
    FA = "fa",
    LA = "la",
    VI = "vi",
    FR = "fr",
    TR = "tr",
    MS = "ms",
    PL = "pl",
    RU = "ru",
}

type MangaDexSiteKey =
    | "al"
    | "ap"
    | "bw"
    | "mu"
    | "nu"
    | "kt"
    | "amz"
    | "ebj"
    | "mal"
    | "cdj"
    | "raw"
    | "engtl";

type MangaStatus = "ongoing" | "completed" | "hiatus" | "cancelled";

export interface MangaDexAttribute<T> {
    id: string;
    type: string;
    attributes: T;
    relationships: MangaDexRelationship[];
}

export interface MangaDexRelationship<T = unknown>
    extends MangaDexAttribute<T> {
    related: string;
}

export interface MangadexResult<T> {
    result: string;
    response: string;
    data: T;
    limit?: number;
    offset?: number;
    total?: number;
}

export interface MangaDexBook
    extends MangaDexAttribute<MangaDexBookAttributes> {}

export interface MangaDexCoverArt {
    description: string;
    volume: string;
    fileName: string;
    locale: MangaDexLanguage;
    createdAt: string;
    updatedAt: string;
    version: number;
}

export interface MangaDexAuthor {
    name: string;
    imageUrl: string;
    biography: unknown[];
    twitter: string;
    pixiv: string;
    melonBook: string;
    fanBox: string;
    booth: string;
    nicoVideo: string;
    skeb: string;
    fantia: string;
    tumblr: string;
    youtube: string;
    weibo: string;
    naver: string;
    website: string;
    createdAt: string;
    updatedAt: string;
    version: number;
}

export interface MangaDexTag {
    name: Record<MangaDexLanguage, string>;
    description: Record<string, unknown>;
    group: string;
    version: number;
}

export interface MangaDexChapter
    extends MangaDexAttribute<MangaDexChapterAttributes> {}

export interface MangaDexChapterAttributes {
    volume: string;
    chapter: string;
    title: string;
    translatedLanguage: MangaDexLanguage;
    externalUrl: string;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    version: number;
}

interface MangaDexBookAttributes {
    title: Record<MangaDexLanguage, string>;
    altTitles: Record<MangaDexLanguage, string>[];
    description: Record<MangaDexLanguage, string>;
    isLocked: false;
    links: Record<MangaDexSiteKey, string>;
    originalLanguage: MangaDexLanguage;
    lastVolume: string;
    lastChapter: string;
    publicationDemographic: string;
    status: MangaStatus;
    year: number;
    contentRating: string;
    tags: MangaDexAttribute<MangaDexTag>[];
    state: string;
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
    availableTranslatedLanguages: MangaDexLanguage[];
    latestUploadedChapter: string;
}

export interface MangaDexImageListResult {
    result: string;
    baseUrl: string;
    chapter: {
        hash: string;
        data: string[];
        dataSaver: string[];
    };
}

export interface MangaDexAggregateResult {
    result: string;
    volumes: Record<
        string,
        {
            volume: string;
            count: number;
            chapters: Record<
                string,
                {
                    chapter: string;
                    id: string;
                    others: string[];
                    count: number;
                }
            >;
        }
    >;
}
