import { LilithRepo } from "../interfaces";
import { CloudFlareConfig } from "../interfaces/base";

import RepositoryBase from "../repo/base";

import NHentai from "../repo/nhentai";

export const useAPILoader = (
    repo: LilithRepo,
    config?: CloudFlareConfig,
): RepositoryBase => {
    switch (repo) {
        default:
            return new NHentai(config);
    }
};
