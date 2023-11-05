import { CloudFlareConfig, CustomFetch, LilithRepo } from "../interfaces";

import RepositoryBase from "../repo/base";

import NHentai from "../repo/nhentai";

export interface UseAPILoaderProps {
    repo: LilithRepo;
    fetchImpl: CustomFetch;
    config?: CloudFlareConfig;
}
export const useAPILoader = ({
    repo,
    fetchImpl = fetch,
    config,
}: UseAPILoaderProps): RepositoryBase => {
    switch (repo) {
        default:
            return new NHentai(config, fetchImpl);
    }
};
