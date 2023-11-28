import { GetTrendingBooks, BookBase } from "../../base/interfaces";
import {
    // MangaDexBook,
    // MangadexResult,
    UseMangaDexMethodProps,
} from "../interfaces";
import { useLilithLog } from "../../utils/log";
// import { useMangaDexMethod } from "./base";

/**
 * Custom hook for fetching the latest NHentai books using the provided options and methods.
 *
 * @param {UseMangaDexMethodProps} props - The options and methods needed for NHentai latest book retrieval.
 * @returns {GetTrendingBooks} - The function for fetching the latest books.
 */
export const useMangaDexGetTrendingBooksMethod = (
    props: UseMangaDexMethodProps,
): GetTrendingBooks => {
    // const {
    //     domains: { baseUrl, apiUrl },
    //     options: { debug, requiredLanguages },
    //     request,
    // } = props;

    // const { getBookResults, RelationshipTypes } = useMangaDexMethod(
    //     props.domains,
    // );

    /**
     *! Mangadex doesnt support providing Trending books in their API.
     *! And scrapping cannot be done atm, due of it using Nuxt js,
     *! therefore the domParserImpl can't reliably
     *! get the necessary elements after the initial load.
     */
    return async (): Promise<BookBase[]> => {
        // const response = await request(`${baseUrl}`);
        // const mangaResponse = await request<MangadexResult<MangaDexBook[]>>(
        //     `${apiUrl}/manga`,
        //     [["includes[]", RelationshipTypes.coverArt]],
        // );
        // const document = await response.getDocument();
        // const mangaResult = await mangaResponse.json();

        // const idList = document
        //     .findAll("div.swiper div.swiper-slide > a")
        //     .map((element) => element.getAttribute("href"));

        // const mangaDexBooks: MangaDexBook[] = mangaResult.data.filter(
        //     (mangaDexBook) => idList.includes(mangaDexBook.id),
        // );

        // useLilithLog(true).log({ mangaResult });

        // const books: BookBase[] = getBookResults(
        //     mangaDexBooks,
        //     requiredLanguages,
        // );

        // useLilithLog(debug).log({ books });

        useLilithLog(props.options.debug);

        return [];
    };
};
