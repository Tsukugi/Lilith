import {
    Extension,
    GetBook,
    LilithLanguage,
    Tag,
    Book,
} from "../../base/interfaces";
import { NHentaiResult, UseNHentaiMethodProps } from "../interfaces";
import { useLilithLog } from "../../utils/log";
import { useNHentaiMethods } from "./base";
import { LilithError } from "../../base";
/**
 * Hook for interacting with NHentai books.
 * @param {UseNHentaiMethodProps} props - Properties required for the hook.
 * @returns {GetBook} - A function that retrieves information about a book based on its identifier.
 */
export const useNHentaiGetBookmethod = ({
    domains: { apiUrl },
    options: { debug },
    getUri,
    request,
}: UseNHentaiMethodProps): GetBook => {
    const { LanguageMapper, getLanguageFromTags } = useNHentaiMethods();

    /**
     * Retrieves information about a book based on its identifier.
     * @param {string} id - The unique identifier of the book.
     * @param {LilithLanguage[]} [requiredLanguages] - Optional array of required languages.
     * @returns {Promise<Book>} - A Promise that resolves to the retrieved book.
     * @throws {LilithError} - Throws an error if the book is not found or no translation is available for the requested language.
     */
    return async (
        id: string,
        requiredLanguages: LilithLanguage[] = Object.values(LilithLanguage),
    ): Promise<Book> => {
        const response = await request<NHentaiResult>(
            `${apiUrl}/gallery/${id}`,
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No book found");
        }

        const book = await response.json();

        const tags: Tag[] = [];

        let author = "unknown";
        book.tags.forEach((tag) => {
            if (tag.type === "author" && author === "unknown") {
                author = tag.name; // Get the first author
            }
            if (tag.type === "tag") {
                tags.push({
                    id: `${tag.id}`,
                    name: tag.name,
                });
            }
        });

        const lilithLanguage: LilithLanguage =
            LanguageMapper[getLanguageFromTags(book.tags)];

        const matchesTranslation = requiredLanguages.includes(lilithLanguage);
        useLilithLog(debug).log({
            requiredLanguages,
            lilithLanguage,
            matchesTranslation,
            tags: book.tags.map((tag) => [tag.type, tag.name]),
        });

        if (!matchesTranslation) {
            throw new LilithError(
                404,
                `No translation for the requested language available, retrieved: ${lilithLanguage}`,
            );
        }

        const { english, japanese, pretty } = book.title;

        const Book: Book = {
            title: english || japanese || pretty,
            id: `${book.id}`,
            author,
            tags,
            cover: {
                uri: getUri(
                    "cover",
                    book.media_id,
                    Extension[book.images.cover.t],
                ),
                width: book.images.cover.w,
                height: book.images.cover.h,
            },
            // NHentai always provides 1 chapter books
            chapters: [
                {
                    id: `${book.id}`,
                    title:
                        book.title[getLanguageFromTags(book.tags)] ||
                        book.title.pretty,
                    language: lilithLanguage,
                    chapterNumber: 1,
                },
            ],
            availableLanguages: [lilithLanguage],
        };
        return Book;
    };
};
