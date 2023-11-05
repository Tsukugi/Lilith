<h1 align="center">Welcome to Lilith!</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

#### A simple API Loader for Typescript

## How to Install

Copy, paste and run, like most packages.

```sh
npm i @atsu/lilith
```

## Usage

Lilith provides a API to get data in a format that is accessible from your app from different sources.

Currently supported sources are: `NHentai`, more to come.

This is a basic example on how to use it.

```ts
import { useState } from "@atsu/lilith";

const loader = useAPILoader({
    repo: LilithRepo.NHentai, // Repository to use
    config: cookies, // configuration for the loader
    fetchImpl: fetch, // (optional) custom fetch implementation
});

const book: Book | null = await loader.get("ass"); // We already get some data
```

## How to extend it

This project is thought to be extended with more sources, to achieve that, basically we would need a class that implements `RepositoryBase`

```ts
// This is from src/repo/base.ts
interface RepositoryBase {
    readonly BASE_URL: string;
    readonly API_URL: string;
    readonly IMAGE_BASE_URL: string;
    readonly AVATAR_URL: string;
    readonly TINY_IMAGE_BASE_URL: string;

    config: CloudFlareConfig | null;

    request: <T>(
        url: string,
        params: string | Record<string, string> | string[][] | URLSearchParams,
    ) => Promise<Result<T>>;

    getUri: (
        type: UriType,
        mediaId: string,
        mime: string,
        pageNumber?: number,
    ) => string;

    get: (identifier: string) => Promise<Book | null>;

    search: (query: string, page: number, sort: Sort) => Promise<SearchResult>;

    paginate: (page: number) => Promise<Pagination>;

    random: (retry: number) => Promise<Book>;
}
```

Add it in `src/repo/`

```ts
// in src/interfaces/index.ts

export enum LilithRepo {
    NHentai = "NHentai",
    // Add a new entry here, to allow users to choose it
}
```

And in the loader do the following:

```ts
switch (repo) {
    case LilithRepo.MyNewRepo: // Add your repo
        return new NewRepoClass(config, fetchImpl); // And add your loader class
    default:
        return new NHentai(config, fetchImpl);
}
```

## Author

👤 **Tsukugi**

-   Github: [@Tsukugi](https://github.com/Tsukugi)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Tsukugi/Lilith/issues).

## Show your support

Give a ⭐️ if this project helped you!

---
