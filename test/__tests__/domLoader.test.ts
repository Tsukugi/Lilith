import { beforeEach, describe, expect, test } from "@jest/globals";
import { useAPILoader } from "../../src/api/loader";
import { useCheerioDomParser, useNodeFetch } from "../../src/impl";
import { Extension, Sort } from "../../src/interfaces/base";
import { LilithRepo } from "../../src/interfaces";

import { cookies, TextMocksForDomParser, fetchMock } from "../nhentaiMock";
import { RepositoryBase } from "../../src/repo/base";

import { useLilithLog } from "../testLogs";
const { log, warn } = useLilithLog(false);

describe("DOMLoader", () => {
    let loader: RepositoryBase = {} as RepositoryBase;
    beforeEach(() => {
        loader = useAPILoader({
            repo: LilithRepo.NHentai,
            configurations: {
                headers: cookies,
                fetchImpl: () => fetchMock({}, TextMocksForDomParser.Search),
                domParser: useCheerioDomParser,
            },
        });
    });

    test("CustomFetchImpl", async () => {
        const thumbnail = loader.getUri("thumbnail", "2726143", Extension.j);

        log(thumbnail);
        expect(thumbnail).toBeDefined();

        const image = await useNodeFetch(thumbnail, {
            method: "GET",
            headers: {
                "User-Agent": cookies.userAgent,
                cookie: cookies.cfClearance,
            },
            credentials: "include",
        });

        if (image.status !== 200) {
            warn(
                "[CustomFetchImpl]: No image found",
                image.status,
                "please check the test",
            );
        }

        log(image);
        expect(image).toBeDefined();
    });

    test("Custom fetch for JSON", async () => {
        const res = await loader.get("480154");

        if (res === null)
            warn("[Custom fetch for JSON] Resource was not found");

        log(res);
        expect(res).toBeDefined();
    });

    test("Custom fetch for text", async () => {
        const randomLoader = useAPILoader({
            repo: LilithRepo.NHentai,
            configurations: {
                headers: cookies,
                fetchImpl: () => fetchMock({}, TextMocksForDomParser.Random),
                domParser: useCheerioDomParser,
            },
        });
        const res = await randomLoader.random();

        if (res === null)
            warn("[Custom fetch for JSON] Resource was not found");

        log(res);
        expect(res).toBeDefined();
    });

    test("Custom fetch for text", async () => {
        const res = await loader.search("ass", 1, Sort.POPULAR);

        if (res === null)
            warn("[Custom fetch for JSON] Resource was not found");

        log(res);
        expect(res).toBeDefined();
    });
});
