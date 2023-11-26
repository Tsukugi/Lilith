import { GetBook, LilithLanguage } from "../../base/interfaces";
import { NHentaiResult } from "../../nhentai/interfaces";
import { Book } from "../../base/interfaces";
import { useLilithLog } from "../../utils/log";
import { UseMethodProps } from "../interfaces";
import { LilithError } from "../../base";

export const useGetBook = (props: UseMethodProps): GetBook => {
    const {
        domains: { apiUrl },
        debug,
        request,
    } = props;

    return async (
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

        useLilithLog(debug).log({ book, requiredLanguages });

        return null;
    };
};
