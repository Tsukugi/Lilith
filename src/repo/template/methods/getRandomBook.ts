import { Book, GetRandomBook } from "../../base/interfaces";
import { useLilithLog } from "../../utils/log";
import { UseMethodProps } from "../interfaces";

export const useGetRandomBook = (props: UseMethodProps): GetRandomBook => {
    const {
        domains: { baseUrl },
        debug,
        request,
    } = props;

    const getRandomBook = async (retry: number = 0): Promise<Book> => {
        const response = await request(`${baseUrl}/random`);

        useLilithLog(debug).log({ response, retry });
        return null;
    };

    return getRandomBook;
};
