import { CloudFlareConfig, CustomFetch, LilithRepo } from "../interfaces";
import { UseDomParser, useDefaultDomParser } from "../parser/domParser";

import { RepositoryBase } from "../repo/base";

import { useNHentaiRepository } from "../repo/nhentai";

export interface APILoaderConfigurations {
    headers: CloudFlareConfig;
    fetchImpl: CustomFetch;
    domParser: UseDomParser;
}

export interface UseAPILoaderProps {
    repo: LilithRepo;
    configurations: Partial<APILoaderConfigurations>;
}
export const useAPILoader = ({
    repo,
    configurations: {
        headers,
        fetchImpl = fetch,
        domParser = useDefaultDomParser,
    },
}: UseAPILoaderProps): RepositoryBase => {
    switch (repo) {
        default:
            return useNHentaiRepository({
                headers,
                fetch: fetchImpl,
                domParser,
            });
    }
};
