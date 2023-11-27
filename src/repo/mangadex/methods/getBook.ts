import { GetBook, LilithLanguage, Tag } from "../../base/interfaces";
import { Book } from "../../base/interfaces";
import { useLilithLog } from "../../utils/log";
import {
    MangaDexAuthor,
    MangaDexBook,
    MangaDexChapter,
    MangaDexCoverArt,
    MangadexResult,
    UseMangaDexMethodProps,
} from "../interfaces";
import { LilithError } from "../../base";
import { UrlParamPair } from "../../../interfaces/fetch";
import { useMangaDexMethod } from "./base";

export const useGetBook = (props: UseMangaDexMethodProps): GetBook => {
    const {
        domains: { apiUrl, tinyImgBaseUrl },
        debug,
        request,
    } = props;

    const {
        ImageSize,
        RelationshipTypes,
        ReverseLanguageMapper,
        getSupportedTranslations,
        findFirstTranslatedValue,
    } = useMangaDexMethod();

    return async (
        identifier: string,
        requiredLanguages: LilithLanguage[] = Object.values(LilithLanguage),
    ): Promise<Book | null> => {
        const manga = await request<MangadexResult<MangaDexBook>>(
            `${apiUrl}/manga/${identifier}`,
            [
                ["includes[]", RelationshipTypes.coverArt],
                ["includes[]", RelationshipTypes.author],
            ],
        );

        if (!manga || manga?.statusCode !== 200) {
            throw new LilithError(manga?.statusCode, "No manga found");
        }

        const mangaResult = await manga.json();

        const { tags, title, availableTranslatedLanguages } =
            mangaResult.data.attributes;

        const supportedTranslations = getSupportedTranslations(
            requiredLanguages,
            availableTranslatedLanguages,
        );

        useLilithLog(debug).log({
            supportedTranslations,
            availableTranslatedLanguages,
        });

        const languageParams: UrlParamPair[] = supportedTranslations.map(
            (lang) => ["translatedLanguage[]", lang],
        );

        const feed = await request<MangadexResult<MangaDexChapter[]>>(
            `${apiUrl}/manga/${identifier}/feed`,
            [["order[chapter]", "asc"], ...languageParams],
        );

        if (!feed || feed?.statusCode !== 200) {
            throw new LilithError(feed?.statusCode, "No manga feed found");
        }

        const chaptersResult = await feed.json();

        const relationships: Record<string, unknown> = (() => {
            const res = {};
            mangaResult.data.relationships.forEach((rel) => {
                res[rel.type] = rel.attributes;
            });
            return res;
        })();

        const { fileName } = relationships[
            RelationshipTypes.coverArt
        ] as MangaDexCoverArt;
        const { name } = relationships[
            RelationshipTypes.author
        ] as MangaDexAuthor;

        if (!fileName) throw new LilithError(404, "No cover found");

        const lilithTags: Tag[] = tags.map((tag) => ({
            id: tag.id,
            name: findFirstTranslatedValue(tag.attributes.name),
        }));

        const cover = {
            uri: `${tinyImgBaseUrl}/${mangaResult.data.id}/${fileName}.${ImageSize}.jpg`,
        };

        return {
            id: identifier,
            title: findFirstTranslatedValue(title),
            author: name,
            chapters: chaptersResult.data
                .filter((chapter) =>
                    supportedTranslations.includes(
                        chapter.attributes.translatedLanguage,
                    ),
                )
                .map((chapter) => ({
                    id: chapter.id,
                    title: chapter.attributes.title,
                    /// It is safe to find as we filter out the non supported
                    language:
                        ReverseLanguageMapper[
                            chapter.attributes.translatedLanguage
                        ],

                    chapterNumber: +chapter.attributes.chapter,
                })),
            cover,
            tags: lilithTags,
            availableLanguages:
                mangaResult.data.attributes.availableTranslatedLanguages
                    .filter((lang) => supportedTranslations.includes(lang))
                    .map((lang) => ReverseLanguageMapper[lang]),
        };
    };
};
