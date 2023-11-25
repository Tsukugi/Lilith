import {
    RepositoryTemplate,
    UriType,
    Extension,
    BookBase,
    Pagination,
} from "../../interfaces/base";
import {
    UrlParamPair,
    Result,
    CustomFetchInitOptions,
} from "../../interfaces/fetch";
import { Image } from "../../interfaces/base";
import { NHentaiPaginateResult } from "../../interfaces/repositories/nhentai";
import { LilithError } from "../base";
import { useRequest } from "../utils/request";
import { NHentaiBase } from "./base";
import { useNHentaiBook } from "./getBook";
import { useNHentaiChapter } from "./getChapter";
import { useNHentaiSearch } from "./search";

const { getLanguageFromTags, LanguageMapper } = NHentaiBase;

export const useNHentaiRepository: RepositoryTemplate = (props) => {
    const { headers, debug } = props;
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

    const getUri = (
        type: UriType,
        mediaId: string,
        mime: Extension,
        pageNumber?: number,
    ): string => {
        if (type === "cover")
            return `${tinyImgBaseUrl}/${mediaId}/cover.${mime}`;
        if (type === "thumbnail")
            return `${tinyImgBaseUrl}/${mediaId}/thumb.${mime}`;
        if (type === "page" && pageNumber !== undefined)
            return `${imgBaseUrl}/${mediaId}/${pageNumber}.${mime}`;
        throw new LilithError(500, "Invalid type or missing page number.");
    };

    const latest = async (page: number): Promise<Pagination> => {
        const response = await request<NHentaiPaginateResult>(
            `${apiUrl}/galleries/all?page=${page}`,
        );

        if (response.statusCode !== 200) {
            throw new LilithError(
                response.statusCode,
                "Could not find a correct pagination",
            );
        }

        const data = await response.json();
        const numPages = data.num_pages || 0;
        const perPageEntries = data.per_page || 0;
        const totalResults = numPages * perPageEntries;

        const books: BookBase[] = (data.result || []).map((result) => {
            const cover = result.images.cover;
            const coverImage: Image = {
                uri: getUri("cover", result.media_id, Extension[cover.t]),
                width: cover.w,
                height: cover.h,
            };
            return {
                id: `${result.id}`,
                title: result.title.english,
                cover: coverImage,
                availableLanguages: [
                    LanguageMapper[getLanguageFromTags(result.tags)],
                ],
            };
        });

        return {
            page,
            totalResults,
            totalPages: numPages,
            results: books,
        };
    };

    const getRandomGeneric = async <T>(
        retry: number = 0,
        onGet: (id: string) => Promise<T>,
    ): Promise<T> => {
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
        const result = (await onGet(id)) || null;

        if (!result) {
            if (retry >= 3) {
                throw new LilithError(404, "Could not fetch a random book.");
            }
            return getRandomGeneric(retry + 1, onGet);
        }

        return result;
    };

    const deps = { debug, apiUrl, request, getUri };
    const { getBook } = useNHentaiBook(deps);
    const { getChapter } = useNHentaiChapter(deps);
    const { search } = useNHentaiSearch({ ...deps, baseUrl });

    return {
        domains: { baseUrl, imgBaseUrl, apiUrl, tinyImgBaseUrl },
        getChapter,
        getBook,
        search,
        getRandomBook: (retry) => getRandomGeneric(retry, getBook),
        getLatestBooks: latest,
    };
};
