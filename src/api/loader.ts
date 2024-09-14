import {
    RepositoryBaseOptions,
    RepositoryTemplate,
} from "../repo/base/interfaces";
import { UseDomParser } from "../interfaces/domParser";
import { CustomFetch, LilithHeaders } from "../interfaces/fetch";

export interface APILoaderConfigurations {
    headers?: Partial<LilithHeaders>;
    fetch: CustomFetch;
    domParser: UseDomParser;
    options: Partial<RepositoryBaseOptions>;
}

export interface UseAPILoaderProps {
    impl: RepositoryTemplate;
    config: Partial<APILoaderConfigurations>;
}
