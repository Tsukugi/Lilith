import { CloudFlareConfig, CustomFetch, LilithRepo } from "../interfaces";
import { UseDomParser } from "../parser/domParser";

import { useCheerioDomParser } from "../impl/useCheerioDomParser";
import { useNodeFetch } from "../impl/useNodeFetch";

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
        fetchImpl = useNodeFetch,
        domParser = useCheerioDomParser,
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
