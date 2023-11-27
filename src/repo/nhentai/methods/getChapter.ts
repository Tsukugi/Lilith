import { Chapter, Extension, GetChapter } from "../../base/interfaces";
import { NHentaiResult, UseNHentaiMethodProps } from "../interfaces";
import { LilithError } from "../../base";
import { useLilithLog } from "../../utils/log";
import { useNHentaiMethods } from "./base";

/**
 * Hook for interacting with NHentai chapters.
 * @param {UseNHentaiMethodProps} props - Properties required for the hook.
 * @returns {GetChapter} - A function that retrieves information about a chapter based on its identifier.
 */
export const useNHentaiGetChapterMethod = ({
    domains: { apiUrl },
    options: { debug },
    getUri,
    request,
}: UseNHentaiMethodProps): GetChapter => {
    const { LanguageMapper, getLanguageFromTags } = useNHentaiMethods();

    /**
     * Retrieves information about a chapter based on its identifier.
     * @param {string} chapterId - The unique identifier of the chapter.
     * @returns {Promise<Chapter>} - A Promise that resolves to the retrieved chapter.
     * @throws {LilithError} - Throws an error if the chapter is not found.
     */
    return async (chapterId: string): Promise<Chapter> => {
        /**
         * NHentai doesn't use chapters; it directly gets the pages from the book as 1 chapter books.
         */
        const response = await request<NHentaiResult>(
            `${apiUrl}/gallery/${chapterId}`,
        );

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No chapter found");
        }

        const book = await response.json();

        useLilithLog(debug).log({
            language: LanguageMapper[getLanguageFromTags(book.tags)],
        });

        return {
            id: chapterId,
            pages: book.images.pages.map((page, index) => ({
                uri: getUri(
                    "page",
                    book.media_id,
                    Extension[book.images.thumbnail.t],
                    index + 1,
                ),
                width: page.w,
                height: page.h,
            })),
            language: LanguageMapper[getLanguageFromTags(book.tags)],
            title:
                book.title[getLanguageFromTags(book.tags)] || book.title.pretty,
            chapterNumber: 1,
        };
    };
};
