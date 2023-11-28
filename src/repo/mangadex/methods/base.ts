import { UrlParamPair } from "../../../interfaces/fetch";
import { LilithError } from "../../base";
import { BookBase, Domains, LilithLanguage } from "../../base/interfaces";
import { ArrayUtils } from "../../utils/array";
import {
    MangaDexBook,
    MangaDexCoverArt,
    MangaDexLanguage,
    MangaDexRelationship,
} from "../interfaces";

enum RelationshipTypes {
    coverArt = "cover_art",
    author = "author",
    manga = "manga",
    tag = "tag",
}

const ImageSize: "256" | "512" = "512";

const LanguageMapper: Record<LilithLanguage, MangaDexLanguage[]> = {
    [LilithLanguage.english]: [MangaDexLanguage.EN],
    [LilithLanguage.japanese]: [MangaDexLanguage.JA, MangaDexLanguage.JA_RO],
    [LilithLanguage.spanish]: [MangaDexLanguage.ES, MangaDexLanguage.ES_LA],
    [LilithLanguage.mandarin]: [
        MangaDexLanguage.ZH,
        MangaDexLanguage.ZH_HK,
        MangaDexLanguage.ZH_RO,
    ],
};

const ReverseLanguageMapper = ((): Record<MangaDexLanguage, LilithLanguage> => {
    const res = {} as Record<MangaDexLanguage, LilithLanguage>;
    Object.keys(LanguageMapper).forEach((key) => {
        LanguageMapper[key].forEach((value) => {
            res[value] = key;
        });
    });
    return res;
})();

const findFirstTranslatedValue = (record: Record<MangaDexLanguage, string>) =>
    Object.values(record)[0] || "";

const getSupportedTranslations = (
    requiredLanguages: LilithLanguage[],
    availableTranslatedLanguages: MangaDexLanguage[],
) => {
    const requiredMangaDexLanguages = requiredLanguages.flatMap(
        (lang) => LanguageMapper[lang],
    );
    const supportedTranslations = ArrayUtils.findCommonElements(
        requiredMangaDexLanguages,
        availableTranslatedLanguages,
    );

    const doesHaveTranslations = supportedTranslations.length > 0;
    if (!doesHaveTranslations) {
        throw new LilithError(
            404,
            `No translation for the requested language available, retrieved: ${supportedTranslations}`,
        );
    }

    return supportedTranslations;
};

const getLanguageParams = (
    requiredLanguages: LilithLanguage[],
): UrlParamPair[] => {
    const languageParams: UrlParamPair[] = [];

    requiredLanguages.forEach((lang) => {
        LanguageMapper[lang].forEach((mangaDexLanguage) => {
            languageParams.push([
                "availableTranslatedLanguage[]",
                mangaDexLanguage,
            ]);
        });
    });

    return languageParams;
};

export const useMangaDexMethod = (domains: Domains) => {
    const makeCover = (book: MangaDexBook) => {
        const mangaId = book.id;
        const coverRelationship = book.relationships.find(
            (relationship) => relationship.type === RelationshipTypes.coverArt,
        ) as MangaDexRelationship<MangaDexCoverArt>;
        if (!coverRelationship || !coverRelationship.attributes) {
            throw new LilithError(
                404,
                "[makeCover] No relationship found for Book",
            );
        }

        const coverFilename = coverRelationship.attributes.fileName;

        return `${domains.tinyImgBaseUrl}/${mangaId}/${coverFilename}.${ImageSize}.jpg`; // Specifies the size (256|512)
    };

    const getBookResults = (
        books: MangaDexBook[],
        requiredLanguages: LilithLanguage[],
    ): BookBase[] => {
        const results = books.map((manga) => {
            const supportedTranslations = getSupportedTranslations(
                requiredLanguages,
                manga.attributes.availableTranslatedLanguages,
            );
            const availableLanguages = supportedTranslations.map(
                (lang) => ReverseLanguageMapper[lang],
            );

            return {
                id: manga.id,
                cover: {
                    uri: makeCover(manga),
                    width: 256,
                    height: 512,
                },
                title: findFirstTranslatedValue(manga.attributes.title),
                availableLanguages: [...new Set(availableLanguages)],
            };
        });
        return results;
    };

    return {
        RelationshipTypes,
        ImageSize,
        ReverseLanguageMapper,
        LanguageMapper,
        findFirstTranslatedValue,
        getSupportedTranslations,
        getLanguageParams,
        getBookResults,
    };
};
