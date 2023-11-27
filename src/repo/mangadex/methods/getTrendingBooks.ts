import { GetTrendingBooks, BookBase } from "../../base/interfaces";
import { UseMangaDexMethodProps } from "../interfaces";
import { useLilithLog } from "../../utils/log";

/**
 * Custom hook for fetching the latest NHentai books using the provided options and methods.
 *
 * @param {UseMangaDexMethodProps} props - The options and methods needed for NHentai latest book retrieval.
 * @returns {GetTrendingBooks} - The function for fetching the latest books.
 */
export const useMangaDexGetTrendingBooksMethod = (
    props: UseMangaDexMethodProps,
): GetTrendingBooks => {
    const {
        domains: { baseUrl },
        options: { debug },
        request,
    } = props;

    return async (): Promise<BookBase[]> => {
        const response = await request(`${baseUrl}`);

        useLilithLog(debug).log({ response });

        return [];
    };
};
