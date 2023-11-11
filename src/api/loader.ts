import { Headers, CustomFetch } from "../interfaces/fetch";
import { UseDomParser } from "../interfaces/domParser";
import { RepositoryBase } from "../interfaces/base";

import { useCheerioDomParser } from "../impl/useCheerioDomParser";
import { useNodeFetch } from "../impl/useNodeFetch";

import { useNHentaiRepository } from "../repo/nhentai";
import { LilithRepo } from "../interfaces";
export interface APILoaderConfigurations {
    headers: Headers;
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
