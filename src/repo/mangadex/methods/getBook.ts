import { GetBook, GetBookOptions, LilithTag } from "../../base/interfaces";
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
import { useRangeFinder } from "../../utils/range";

export const useMangaDexGetBookMethod = (
    props: UseMangaDexMethodProps,
): GetBook => {
    const {
        domains: { apiUrl, tinyImgBaseUrl },
        options: { debug, requiredLanguages },
        request,
    } = props;

    const {
        ImageSize,
        RelationshipTypes,
        ReverseLanguageMapper,
        getSupportedTranslations,
        findFirstTranslatedValue,
    } = useMangaDexMethod(props.domains);

    return async (identifier, options = {}): Promise<Book | null> => {
        const innerOptions: GetBookOptions = {
            ...options,
            chapterList: {
                page: 1,
                size: 100,
                orderBy: "desc",
                ...options.chapterList,
            },
        };

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

        const pageSize = innerOptions.chapterList.size;
        const { pageToRange } = useRangeFinder({ pageSize });
        const { startIndex } = pageToRange(innerOptions.chapterList.page);

        useLilithLog(debug).log({
            supportedTranslations,
            availableTranslatedLanguages,
            pageSize,
            startIndex,
        });

        const languageParams: UrlParamPair[] = supportedTranslations.map(
            (lang) => ["translatedLanguage[]", lang],
        );

        const feed = await request<MangadexResult<MangaDexChapter[]>>(
            `${apiUrl}/manga/${identifier}/feed`,
            [
                ["limit", pageSize],
                ["offset", startIndex],
                ["order[chapter]", innerOptions.chapterList.orderBy],
                ...languageParams,
            ],
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

        const lilithTags: LilithTag[] = tags.map((tag) => ({
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
