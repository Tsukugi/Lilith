import { LilithHeaders, CustomFetch } from "../interfaces/fetch";
import { UseDomParser } from "../interfaces/domParser";

import { useCheerioDomParser } from "../impl/useCheerioDomParser";
import { useNodeFetch } from "../impl/useNodeFetch";

import { LilithRepo } from "../interfaces";

import { useMangaDexRepository } from "../repo/mangadex";
import { useNHentaiRepository } from "../repo/nhentai";
import { RepositoryBase, RepositoryBaseProps } from "../repo/base/interfaces";
export interface APILoaderConfigurations {
    headers: LilithHeaders;
    fetch: CustomFetch;
    domParser: UseDomParser;
    debug: boolean;
}

export interface UseAPILoaderProps {
    repo: LilithRepo;
    configurations?: Partial<APILoaderConfigurations>;
}
export const useAPILoader = ({
    repo,
    configurations,
}: UseAPILoaderProps): RepositoryBase => {
    const innerConfigurations: RepositoryBaseProps = {
        fetch: useNodeFetch,
        domParser: useCheerioDomParser,
        debug: false,
        ...configurations,
    };

    switch (repo) {
        case LilithRepo.MangaDex:
            return useMangaDexRepository(innerConfigurations);
        default:
            return useNHentaiRepository(innerConfigurations);
    }
};
