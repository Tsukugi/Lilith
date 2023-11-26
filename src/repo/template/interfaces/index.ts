import { LilithRequest } from "../../../interfaces/fetch";
import { Domains, RepositoryBaseProps } from "../../base/interfaces";

export interface UseMethodProps extends RepositoryBaseProps {
    domains: Domains;
    request: LilithRequest;
}

//!  Please rename RepositoryName to the proper name of the repository, and delete these comments
export interface RepositoryNameTag /* ... replace your repository tag type here  */ {
    id: string;
    name: string;
    type: string;
}
export enum RepositoryNameLanguage /* ... replace your repository languages here  */ {
    english = "en",
    japanese = "jp",
    chinese = "zh",
}
