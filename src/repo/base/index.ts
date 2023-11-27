import { Sort } from "./interfaces";

/*
 *  This is the size that will define a Page in Search(), we use 25 basically to fit NH search results
 */
export const MaxSearchSize = 25;

export const DefaultSearchOptions = {
    sort: Sort.RECENT,
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
