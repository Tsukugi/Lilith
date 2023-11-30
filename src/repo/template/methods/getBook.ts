import { GetBook, GetBookOptions } from "../../base/interfaces";
import { Book } from "../../base/interfaces";
import { useLilithLog } from "../../utils/log";
import { UseMethodProps } from "../interfaces";
import { LilithError } from "../../base";

export const useGetBookMethod = (props: UseMethodProps): GetBook => {
    const {
        domains: { apiUrl },
        options: { debug, requiredLanguages },
        request,
    } = props;

    return async (
        id: string,
        options?: Partial<GetBookOptions>,
    ): Promise<Book> => {
        // Define default values here
        const innerOptions: GetBookOptions = { ...options };

        const response = await request(`${apiUrl}/gallery/${id}`);

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No book found");
        }

        const book = await response.json();

        useLilithLog(debug).log({ book, requiredLanguages, innerOptions });

        return null;
    };
};
