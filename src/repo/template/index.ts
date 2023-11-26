import { RepositoryTemplate } from "../base/interfaces";
import {
    UrlParamPair,
    Result,
    CustomFetchInitOptions,
} from "../../interfaces/fetch";
import { LilithError } from "../base";
import { useRequest } from "../utils/request";
import { UseMethodProps } from "./interfaces";
import { useGetBook } from "./methods/getBook";
import { useGetChapter } from "./methods/getChapter";
import { useGetRandomBook } from "./methods/getRandomBook";
import { useSearch } from "./methods/search";
import { useLatest } from "./methods/latest";

// ! Please rename to use{RepositoryName}Repository and delete these comments
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
        getChapter: useGetChapter(methodProps),
        getBook: useGetBook(methodProps),
        search: useSearch(methodProps),
        getRandomBook: useGetRandomBook(methodProps),
        getLatestBooks: useLatest(methodProps),
    };
};
