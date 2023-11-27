import { useCheerioDomParser } from "../impl/useCheerioDomParser";
import { useNodeFetch } from "../impl/useNodeFetch";

import { LilithRepo } from "../interfaces";

import { useMangaDexRepository } from "../repo/mangadex";
import { useNHentaiRepository } from "../repo/nhentai";
import {
    LilithLanguage,
    RepositoryBase,
    RepositoryBaseOptions,
    RepositoryBaseProps,
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
    repo: LilithRepo;
    config?: Partial<APILoaderConfigurations>;
}
export const useAPILoader = ({
    repo,
    config,
}: UseAPILoaderProps): RepositoryBase => {
    const innerConfigurations: RepositoryBaseProps = {
        fetch: useNodeFetch,
        domParser: useCheerioDomParser,
        ...config,
        options: {
            debug: false,
            requiredLanguages: Object.values(LilithLanguage),
            ...config.options,
        },
    };

    switch (repo) {
        case LilithRepo.MangaDex:
            return useMangaDexRepository(innerConfigurations);
        default:
            return useNHentaiRepository(innerConfigurations);
    }
};
