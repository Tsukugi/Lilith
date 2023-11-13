import { Headers, CustomFetch } from "../interfaces/fetch";
import { UseDomParser } from "../interfaces/domParser";
import { RepositoryBase } from "../interfaces/base";

import { useCheerioDomParser } from "../impl/useCheerioDomParser";
import { useNodeFetch } from "../impl/useNodeFetch";

import { LilithRepo } from "../interfaces";

import { useMangaDexRepository } from "../repo/mangadex";
import { useNHentaiRepository } from "../repo/nhentai";
export interface APILoaderConfigurations {
    headers: Headers;
    fetchImpl: CustomFetch;
    domParser: UseDomParser;
    debug: boolean;
}

export interface UseAPILoaderProps {
    repo: LilithRepo;
    configurations?: Partial<APILoaderConfigurations>;
}
export const useAPILoader = ({
    repo,
    configurations: {
        headers,
        fetchImpl = useNodeFetch,
        domParser = useCheerioDomParser,
        debug = false,
    },
}: UseAPILoaderProps): RepositoryBase => {
    switch (repo) {
        case LilithRepo.MangaDex:
            return useMangaDexRepository({
                headers,
                fetch: fetchImpl,
                domParser,
                debug,
            });
        default:
            return useNHentaiRepository({
                headers,
                fetch: fetchImpl,
                domParser,
                debug,
            });
    }
};
