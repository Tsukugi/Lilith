import { CloudFlareConfig, CustomFetch, LilithRepo } from "../interfaces";

import RepositoryBase from "../repo/base";

import NHentai from "../repo/nhentai";

export interface UseAPILoaderProps {
    repo: LilithRepo;
    config?: CloudFlareConfig;
    fetchImpl?: CustomFetch;
    domParser?: (stringDom: string, type: string) => Document;
}
export const useAPILoader = ({
    repo,
    config,
    fetchImpl = fetch,
    domParser = new DOMParser().parseFromString,
}: UseAPILoaderProps): RepositoryBase => {
    switch (repo) {
        default:
            return new NHentai(config, fetchImpl, domParser);
    }
};
