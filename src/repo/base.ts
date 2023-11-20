import { LilithLanguage, Sort } from "../interfaces/base";
/*
 *  This is the size that will define a Page in Search(), we use 25 basically to fit NH search results
 */
export const MaxSearchSize = 25;

export const DefaultSearchOptions = {
    requiredLanguages: Object.values(LilithLanguage),
    sort: Sort.RECENT,
    page: 1,
    size: MaxSearchSize,
};
