export enum LilithRepo {
    NHentai = "NHentai",
}

export interface Result<T> {
    statusCode: number;
    json: () => Promise<T>;
    getDocument: () => Promise<Document>;
}
