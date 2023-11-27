import { LilithRequest } from "../../../interfaces/fetch";
import { Domains, RepositoryBaseProps } from "../../base/interfaces";

//! Please rename to use{RepositoryName}MethodProps and delete these comments
export interface UseMethodProps extends RepositoryBaseProps {
    domains: Domains;
    request: LilithRequest;
}

//!  Please rename {RepositoryName}Tag to the proper name of the repository, and delete these comments
export interface RepositoryNameTag /* ... replace your repository tag type here  */ {
    id: string;
    name: string;
    type: string;
}

//!  Please rename {RepositoryName}Language to the proper name of the repository, and delete these comments
export enum RepositoryNameLanguage /* ... replace your repository languages here  */ {
    english = "en",
    japanese = "jp",
    chinese = "zh",
}
