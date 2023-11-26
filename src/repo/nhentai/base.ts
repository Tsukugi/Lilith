import { LilithLanguage } from "../base/interfaces";
import { NHentaiLanguage, NHentaiTag } from "./interfaces";

/**
 * The size of results per page in an NHentai search.
 */
const NHentaiPageResultSize = 25;

/**
 * Mapper that converts NHentai language codes to LilithLanguage enum values.
 */
const LanguageCodeMapper: Record<string, LilithLanguage> = {
    "12227": LilithLanguage.english,
    "29963": LilithLanguage.mandarin,
    "6346": LilithLanguage.japanese,
};

/**
 * Mapper that converts NHentaiLanguage enum values to LilithLanguage enum values.
 */
const LanguageMapper: Record<NHentaiLanguage, LilithLanguage> = {
    [NHentaiLanguage.english]: LilithLanguage.english,
    [NHentaiLanguage.japanese]: LilithLanguage.japanese,
    [NHentaiLanguage.chinese]: LilithLanguage.mandarin,
};

/**
 * Retrieves the NHentaiLanguage from a given array of NHentai tags.
 * @param {NHentaiTag[]} tags - Array of NHentai tags.
 * @returns {NHentaiLanguage} - NHentaiLanguage enum value.
 */
const getLanguageFromTags = (tags: NHentaiTag[]): NHentaiLanguage => {
    const filteredTag = tags.find(
        (tag) => tag.type === "language" && LanguageMapper[tag.name],
    );
    const result = filteredTag?.name || NHentaiLanguage.japanese;
    return result as NHentaiLanguage;
};

/**
 * Extracts LilithLanguage array from the given title string.
 * @param {string} title - Title string.
 * @returns {LilithLanguage[]} - Array of LilithLanguage values.
 */
const extractLanguages = (title: string): LilithLanguage[] => {
    const matches = title.toLowerCase().match(/\[(.*?)\]/g);
    const possibleLanguages = matches
        ? matches.map((match) => match.slice(1, -1))
        : [];
    const languages: LilithLanguage[] = possibleLanguages
        .filter((lang) => Object.keys(LanguageMapper).includes(lang))
        .map((lang) => LanguageMapper[lang]);

    return languages;
};

/**
 * NHentaiBase object containing various utilities related to NHentai integration.
 */
export const NHentaiBase = {
    NHentaiPageResultSize,
    LanguageMapper,
    LanguageCodeMapper,
    extractLanguages,
    getLanguageFromTags,
};
