import { RepositoryTemplate } from "../base/interfaces";
import {
    UrlParamPair,
    Result,
    CustomFetchInitOptions,
} from "../../interfaces/fetch";
import { useRequest } from "../utils/request";
import { UseMangaDexMethodProps } from "./interfaces";
import { useGetBook } from "./methods/getBook";
import { useGetChapter } from "./methods/getChapter";
import { useGetRandomBook } from "./methods/getRandomBook";
import { useSearch } from "./methods/search";
import { useLatest } from "./methods/latest";

export const useMangaDexRepository: RepositoryTemplate = (props) => {
    const { doRequest } = useRequest(props);
    const { debug } = props;

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
        debug,
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
