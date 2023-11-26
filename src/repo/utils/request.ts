import { RepositoryBaseProps } from "../base/interfaces";
import {
    UrlParamValue,
    UrlParamPair,
    CustomFetchInitOptions,
    Result,
} from "../../interfaces/fetch";
import { LilithError } from "../base";
import { useLilithLog } from "./log";

const useParamIfExists = (
    key: string,
    value: UrlParamValue | undefined,
): string => {
    return value !== undefined ? `${key}=${value}` : "";
};
const useUrlWithParams = (url: string, params?: UrlParamPair[]) => {
    if (!params || params.length === 0) return url;

    let useParams = "";
    params.forEach((param) => {
        const value = useParamIfExists(param[0], param[1]);
        if (!value) return;
        const separator = useParams ? "&" : "";
        useParams = `${useParams}${separator}${value}`;
    });

    return `${url}?${useParams}`;
};

export const useRequest = ({
    fetch,
    domParser,
    debug,
}: RepositoryBaseProps) => {
    const doRequest = async <T>(
        url: string,
        params?: UrlParamPair[],
        requestOptions: Partial<CustomFetchInitOptions> = {},
    ): Promise<Result<T>> => {
        try {
            const apiUrl = useUrlWithParams(url, params);

            useLilithLog(debug).log(apiUrl);

            const response = await fetch(apiUrl, requestOptions);

            const getDocument = async () => domParser(await response.text());

            return {
                json: response.json,
                statusCode: response.status,
                getDocument,
            };
        } catch (error) {
            throw new LilithError(
                error.status || 500,
                "There was an error on the request",
                error,
            );
        }
    };

    return { doRequest };
};

export const RequestUtils = {
    useUrlWithParams,
    useParamIfExists,
};
