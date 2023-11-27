import { RepositoryTemplate } from "../base/interfaces";
import {
    UrlParamPair,
    Result,
    CustomFetchInitOptions,
} from "../../interfaces/fetch";
import { useRequest } from "../utils/request";
import { UseMangaDexMethodProps } from "./interfaces";
import { useMangaDexGetBookMethod } from "./methods/getBook";
import { useMangaDexGetChapterMethod } from "./methods/getChapter";
import { useMangaDexGetRandomBookMethod } from "./methods/getRandomBook";
import { useMangaDexSearchMethod } from "./methods/search";
import { useMangaDexGetLatestBooksMethod } from "./methods/latest";
import { useMangaDexGetTrendingBooksMethod } from "./methods/getTrendingBooks";

export const useMangaDexRepository: RepositoryTemplate = (props) => {
    const { doRequest } = useRequest(props);
    const { options } = props;

    const baseUrl = "https://mangadex.org";
    const apiUrl = "https://api.mangadex.org";

    const imgBaseUrl = "https://uploads.mangadex.org/data";
    const tinyImgBaseUrl = "https://uploads.mangadex.org/covers";

    const request = async <T>(
        url: string,
        params: UrlParamPair[] = [],
    ): Promise<Result<T>> => {
        const requestOptions: Partial<CustomFetchInitOptions> = {
            method: "GET",
        };
        return doRequest(url, params, requestOptions);
    };

    const domains = { baseUrl, imgBaseUrl, apiUrl, tinyImgBaseUrl };
    const methodProps: UseMangaDexMethodProps = {
        ...props,
        options,
        domains,
        request,
    };

    return {
        domains,
        getChapter: useMangaDexGetChapterMethod(methodProps),
        getBook: useMangaDexGetBookMethod(methodProps),
        search: useMangaDexSearchMethod(methodProps),
        getRandomBook: useMangaDexGetRandomBookMethod(methodProps),
        getLatestBooks: useMangaDexGetLatestBooksMethod(methodProps),
        getTrendingBooks: useMangaDexGetTrendingBooksMethod(methodProps),
    };
};
