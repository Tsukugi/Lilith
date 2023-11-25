import { Chapter, Extension, UriType } from "../../interfaces/base";
import { LilithRequest } from "../../interfaces/fetch";
import { NHentaiResult } from "../../interfaces/repositories/nhentai";
import { LilithError } from "../base";
import { useLilithLog } from "../utils/log";
import { NHentaiBase } from "./base";

interface UseNHentaiChapterProps {
    apiUrl: string;
    debug: boolean;

    getUri: (
        type: UriType,
        mediaId: string,
        mime: Extension,
        pageNumber?: number,
    ) => string;
    request: LilithRequest;
}
export const useNHentaiChapter = ({
    apiUrl,
    debug,
    getUri,
    request,
}: UseNHentaiChapterProps) => {
    const { LanguageMapper, getLanguageFromTags } = NHentaiBase;

    const getChapter = async (chapterId: string): Promise<Chapter> => {
        /**
         * NHentai doesn't use chapters, it directly gets the pages from the book, as 1 chapter books
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

    return { getChapter };
};
