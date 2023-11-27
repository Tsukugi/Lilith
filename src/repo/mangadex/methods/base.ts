import { LilithError } from "../../base";
import { LilithLanguage } from "../../base/interfaces";
import { ArrayUtils } from "../../utils/array";
import { MangaDexLanguage } from "../interfaces";

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

export const useMangaDexMethod = () => {
    return {
        RelationshipTypes,
        ImageSize,
        ReverseLanguageMapper,
        LanguageMapper,
        findFirstTranslatedValue,
        getSupportedTranslations,
    };
};
