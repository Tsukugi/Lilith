import { LilithLanguage } from "../../base/interfaces";
import { RepositoryNameLanguage, RepositoryNameTag } from "../interfaces";

/**
 * Mapper that converts RepositoryLanguage enum values to LilithLanguage enum values.
 */
const LanguageMapper: Record<RepositoryNameLanguage, LilithLanguage> = {
    [RepositoryNameLanguage.english]: LilithLanguage.english,
    [RepositoryNameLanguage.japanese]: LilithLanguage.japanese,
    [RepositoryNameLanguage.chinese]: LilithLanguage.mandarin,
};

/**
 * Retrieves the RepositoryLanguage from a given array of tags.
 * @param {RepositoryNameTag[]} tags - Array of NHentai tags.
 * @returns {RepositoryNameLanguage} - RepositoryLanguage enum value.
 */
const getLanguageFromTags = (
    tags: RepositoryNameTag[],
): RepositoryNameLanguage => {
    const filteredTag = tags.find(
        (tag) => tag.type === "language" && LanguageMapper[tag.name],
    );
    const result = filteredTag?.name || RepositoryNameLanguage.japanese;
    return result as RepositoryNameLanguage;
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

//! Please rename to use{RepositoryName}Method and delete these comments
export const useMethod = () => {
    return {
        extractLanguages,
        getLanguageFromTags,
        LanguageMapper,
    };
};
