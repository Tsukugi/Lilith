<h1 align="center">Welcome to the Lilith Project!</h1>
<p>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

#### A simple, repository agnostic, API Loader for Typescript

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
    config: {}, // optional configurations for specific repositories
});

/**
 * Here are some example usages
 */

// We get some search result with some basic book information.
const search: SearchResult = await loader.search("komi");

// We get a book information, like title and chapters
const book: SearchResult = await loader.getBook(
    "a96676e5-8ae2-425e-b549-7f15dd34a6d8",
);

// We get mainly the image URLs from a Chapter
const chapter: Chapter = await loader.getChapter(
    "940f02a3-c4dc-4cc2-9275-5906fcbdb453",
);
```

## Repository specifics

### NHentai

NHentai is protected with `Cloudflare` DDoS protection (Normally is this delay on the initial load while we see the message _"Making sure that the connection is secure"_).

We need to already pass this challenge to start to make requests.

When you, in your browser pass this challenge, you get a cookie appended to your further requests.

The `cookie` value is on the request headers, and can be seen in your browser by inspecting the page and while using the `network` tab, you reload, and then check the first request (usually to `https://nhentai.net`)

It should look like this (example):

```
cf_clearance=AWJDIseOad1233awgyjADJO41123dwaodHIAWDH-0-1-aab50120.3211.2312faw-100.0.1; csrftoken=awdwDAWDJdpoijPAwdjoaw23DawspojwAWdjoawedaAWDPOKPDWADwad; cf_chl_2=0awdKFWAjpaWD
```

The important one is `cf_clearance`, but you can copy all of it.

And also we need the `User-Agent`, this can be seen with the same method instead of `cookie`, should be something like this:

```
Mozilla/1.0 (X41; Linux x86_22; rv:100.0) Gecko/12121214 Firefox/69.0
```

By knowing this information we NEED to append it in our loader

```ts
const loader = useAPILoader({
    repo: LilithRepo.NHentai,
    config: {
        headers: {
            cookie: "... your cookie value",
            ["User-Agent"]: "... your user agent",
        },
    },
});
```

If you have an invalid, expired or absent headers, you will have code `403` errors on either Lilith or the requests themselves.

### MangaDex

Currently `getTrendingBooks` is not supported on MangaDex, as its API doesn't support it, and also we cannot scrap the website at the moment.

# 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Tsukugi/Lilith/issues).

Also there is a README for developers [here!](./README_DEV.md)

## Show your support

Give a ⭐️ if this project helped you!

---
