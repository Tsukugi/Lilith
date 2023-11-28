import { GetTrendingBooks, BookBase } from "../../base/interfaces";
import { UseNHentaiMethodProps } from "../interfaces";
import { useLilithLog } from "../../utils/log";
import { useNHentaiMethods } from "./base";

/**
 * Custom hook for fetching the latest NHentai books using the provided options and methods.
 *
 * @param {UseNHentaiMethodProps} props - The options and methods needed for NHentai latest book retrieval.
 * @returns {GetTrendingBooks} - The function for fetching the latest books.
 */
export const useNHentaiGetTrendingBooksMethod = (
    props: UseNHentaiMethodProps,
): GetTrendingBooks => {
    const {
        domains: { baseUrl },
        options: { debug, requiredLanguages },
        request,
    } = props;

    const { getGalleries } = useNHentaiMethods();
    return async (): Promise<BookBase[]> => {
        const response = await request(`${baseUrl}`);

        const document = await response.getDocument();

        const popularGalleriesContainerSelector =
            "div.container.index-container.index-popular";

        const galleries = getGalleries(
            document,
            requiredLanguages,
            popularGalleriesContainerSelector,
        );

        useLilithLog(debug).log({ galleries });

        return galleries;
    };
};
