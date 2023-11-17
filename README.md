<h1 align="center">Welcome to the Lilith Project!</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.4.7-blue.svg?cacheSeconds=2592000" />
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

Currently supported sources are: `NHentai` and `MangaDex`, more to come.

This is a basic example on how to use it.

```ts
import { useAPILoader } from "@atsu/lilith";

const loader = useAPILoader({
    repo: LilithRepo.MangaDex, // Repository to use
    configurations: {}, // optional configurations for specific repositories
});

const results: SearchResult = await loader.search("komi"); // We already get some data
```

## How to extend it

This project is thought to be extended with more sources, to achieve that, basically we would need a new `useMyNewRepository` that is of type `RepositoryTemplate`

```ts
// This is from src/repo/base.ts
export interface Domains {
    readonly baseUrl: string;
    readonly apiUrl: string;
    readonly imgBaseUrl: string;
    readonly tinyImgBaseUrl: string;
}

export interface RepositoryBase {
    domains: Domains;

    request: <T>(url: string, params?: string) => Promise<Result<T>>;

    getChapter: (identifier: string) => Promise<Chapter>;

    getBook: (identifier: string) => Promise<Book>;

    search: (
        query: string,
        page?: number,
        sort?: Sort,
    ) => Promise<SearchResult>;

    randomBook: (retry?: number) => Promise<Book>;

    paginate?: (page: number) => Promise<Pagination>;
}

export interface RepositoryBaseProps {
    headers: Headers;
    fetch: CustomFetch;
    domParser: UseDomParser;
    debug?: boolean;
}

export type RepositoryTemplate = (props: RepositoryBaseProps) => RepositoryBase; // This one
```

Add it in `src/repo/`

```ts
// in src/interfaces/index.ts

export enum LilithRepo {
    /* ... Already supported entries */
    myNewRepo = "myNewRepo", // Add a new entry here, to allow users to choose it
}
```

And in the loader do the following:

```ts
switch (repo) {
    // Add your repo as a new case
    case LilithRepo.MyNewRepo:
        return new useMyNewRepository({
            headers,
            fetch,
            domParser,
            debug,
        });

    /* ...rest of the options */
}
```

One last thing to note is the tests, currently they are working with Jest, but they aren't as extensive nor strict as I would like. If you want to help on this, it would be awesome too.

--- More documentation for test comming soon!

## Author

👤 **Tsukugi**

-   Github: [@Tsukugi](https://github.com/Tsukugi)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Tsukugi/Lilith/issues).

## Show your support

Give a ⭐️ if this project helped you!

---
