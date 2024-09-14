import { Sort } from "./interfaces";

/*
 *  This is the size that will define a Page in Search
 */
export const MaxSearchSize = 25;
export const MaxLatestBooksSize = 25;

export const DefaultSearchOptions = {
    sort: Sort.Latest,
    page: 1,
    size: MaxSearchSize,
};

export class LilithError {
    status: number;
    message: string;
    data?: unknown;

    constructor(status: number, message: string, data?: unknown) {
        this.data = data;
        this.status = status;
        this.message = message;
    }
}
