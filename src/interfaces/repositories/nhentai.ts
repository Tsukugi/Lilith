interface NHentaiPage {
    t: string;
    w: number;
    h: number;
}

export interface NHentaiTag {
    id: number;
    type: string;
    name: string;
    url: string;
    count: number;
}

export interface NHentaiResult {
    id: number;
    media_id: string;
    title: {
        english: string;
        japanese: string;
        pretty: string;
    };
    images: {
        pages: NHentaiPage[];
        cover: NHentaiPage;
        thumbnail: NHentaiPage;
    };
    scanlator: string;
    upload_date: number;
    tags: NHentaiTag[];
    num_pages: number;
    num_favorites: number;
}

export interface NHentaiPaginateResult {
    result: NHentaiResult[];
    num_pages: number;
    per_page: number;
}

export enum NHentaiLanguage {
    english = "english",
    japanese = "japanese",
    chinese = "chinese",
}
