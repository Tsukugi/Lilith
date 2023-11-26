import { Pagination, GetLatestBooks } from "../../base/interfaces";
import { UseMethodProps } from "../interfaces";
import { useLilithLog } from "../../utils/log";

/**
 * Custom hook for fetching the latest NHentai books using the provided options and methods.
 *
 * @param {UseMethodProps} props - The options and methods needed for NHentai latest book retrieval.
 * @returns {GetLatestBooks} - The function for fetching the latest books.
 */
export const useLatest = (props: UseMethodProps): GetLatestBooks => {
    const {
        domains: { baseUrl },
        debug,
        request,
    } = props;

    return async (page: number): Promise<Pagination> => {
        const response = await request(`${baseUrl}`);

        useLilithLog(debug).log({ response });

        return {
            page,
            totalResults: 0,
            totalPages: 0,
            results: [],
        };
    };
};
