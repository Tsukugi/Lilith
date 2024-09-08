import { RepositoryTemplate } from "../base/interfaces";
import {
    UrlParamPair,
    Result,
    CustomFetchInitOptions,
} from "../../interfaces/fetch";
import { useRequest } from "../utils/request";
import { useNHentaiGetBookmethod } from "./methods/getBook";
import { useNHentaiGetChapterMethod } from "./methods/getChapter";
import { useNHentaiSearchMethod } from "./methods/search";
import { useNHentaiGetRandomBookMethod } from "./methods/getRandomBook";
import { useNHentaiGetLatestBooksMethod } from "./methods/latest";
import { UseNHentaiMethodProps } from "./interfaces";
import { useNHentaiGetTrendingBooksMethod } from "./methods/getTrendingBooks";

export const useNHentaiRepository: RepositoryTemplate = (props) => {
    const { headers } = props;
    const { doRequest } = useRequest(props);

    const baseUrl = "https://nhentai.net";
    const apiUrl = "https://nhentai.net/api";
    const imgBaseUrl = "https://i.nhentai.net/galleries";
    const tinyImgBaseUrl = imgBaseUrl.replace("/i.", "/t.");

    const request = async <T>(
        url: string,
        params: UrlParamPair[] = [],
    ): Promise<Result<T>> => {
        const requestOptions: CustomFetchInitOptions = {
            method: "GET",
            headers: {
                cookie: headers.cookie,
                "User-Agent": headers["User-Agent"],
            },
            credentials: "include",
        };

        return doRequest(url, params, requestOptions);
    };

    const domains = { baseUrl, imgBaseUrl, apiUrl, tinyImgBaseUrl };
    const methodProps: UseNHentaiMethodProps = {
        ...props,
        domains,
        request,
    };

    return {
        domains,
        getChapter: useNHentaiGetChapterMethod(methodProps),
        getBook: useNHentaiGetBookmethod(methodProps),
        search: useNHentaiSearchMethod(methodProps),
        getRandomBook: useNHentaiGetRandomBookMethod(methodProps),
        getLatestBooks: useNHentaiGetLatestBooksMethod(methodProps),
        getTrendingBooks: useNHentaiGetTrendingBooksMethod(methodProps),
    };
};
