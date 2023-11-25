import { Extension, LilithLanguage, Tag, UriType } from "../../interfaces/base";
import { LilithRequest } from "../../interfaces/fetch";
import { NHentaiResult } from "../../interfaces/repositories/nhentai";
import { Book } from "../../interfaces/base";
import { useLilithLog } from "../utils/log";
import { NHentaiBase } from "./base";
import { LilithError } from "../base";

interface UseNHentaiBookProps {
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
export const useNHentaiBook = ({
    apiUrl,
    debug,
    getUri,
    request,
}: UseNHentaiBookProps) => {
    const { LanguageMapper, getLanguageFromTags } = NHentaiBase;

    const getBook = async (
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
            //NHentai always provides 1 chapter books
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

    return { getBook };
};
