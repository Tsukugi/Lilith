import { Book, GetRandomBook } from "../../base/interfaces";
import { LilithError } from "../../base";
import { UseNHentaiMethodProps } from "../interfaces";
import { useNHentaiBook } from "./getBook";

/**
 * Hook for retrieving a random book from NHentai.
 * @param {UseNHentaiMethodProps} props - Properties required for the hook.
 * @returns {GetRandomBook} - A function that retrieves a random book.
 */
export const useNHentaiRandomBook = (
    props: UseNHentaiMethodProps,
): GetRandomBook => {
    const {
        domains: { baseUrl },
        request,
    } = props;

    /**
     * Retrieves a random book from NHentai.
     * @param {number} [retry=0] - The number of times to retry if fetching a random book fails.
     * @returns {Promise<Book | null>} - A Promise that resolves to the retrieved random book or null if unsuccessful.
     * @throws {LilithError} - Throws an error if the random book cannot be fetched after the specified number of retries.
     */
    const getRandomBook = async (retry: number = 0): Promise<Book> => {
        const response = await request(`${baseUrl}/random`);

        const document = await response.getDocument();

        const idElement = document.find("h3#gallery_id");

        if (!idElement || !idElement.getText()) {
            throw new LilithError(
                404,
                "Could not find ID element in the response.",
            );
        }

        const id = idElement.getText().replace("#", "");
        const result = (await useNHentaiBook(props)(id)) || null;

        if (!result) {
            if (retry >= 3) {
                throw new LilithError(404, "Could not fetch a random book.");
            }
            return getRandomBook(retry + 1);
        }

        return result;
    };

    return getRandomBook;
};
