import { RepositoryTemplate } from "../base/interfaces";
import {
    UrlParamPair,
    Result,
    CustomFetchInitOptions,
} from "../../interfaces/fetch";
import { LilithError } from "../base";
import { useRequest } from "../utils/request";
import { UseMethodProps } from "./interfaces";
import { useGetBookMethod } from "./methods/getBook";
import { useGetChapterMethod } from "./methods/getChapter";
import { useGetRandomBookMethod } from "./methods/getRandomBook";
import { useSearchMethod } from "./methods/search";
import { useGetLatestBooksMethod } from "./methods/latest";
import { useGetTrendingBooksMethod } from "./methods/getTrendingBooks";

//! Please rename to use{RepositoryName}Repository and delete these comments
export const useRepository: RepositoryTemplate = (props) => {
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
        if (!headers) {
            throw new LilithError(
                403,
                "cloudflare cookie and user-agent invalid, provide a different one.",
            );
        }
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
    const methodProps: UseMethodProps = {
        ...props,
        domains,
        request,
    };

    return {
        domains,
        getChapter: useGetChapterMethod(methodProps),
        getBook: useGetBookMethod(methodProps),
        search: useSearchMethod(methodProps),
        getRandomBook: useGetRandomBookMethod(methodProps),
        getLatestBooks: useGetLatestBooksMethod(methodProps),
        getTrendingBooks: useGetTrendingBooksMethod(methodProps),
    };
};
