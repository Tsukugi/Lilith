import { beforeEach, describe, expect, test } from "@jest/globals";

import { useAPILoader } from "../../src/api/loader";

import { Sort, RepositoryBase } from "../../src/interfaces/base";
import { LilithRepo } from "../../src/interfaces";

import { cookies, TextMocksForDomParser, fetchMock } from "../nhentaiMock";
import { useLilithLog } from "../../src/repo/log";
const debug = false;
const { log, warn } = useLilithLog(debug);

describe("DOMLoader", () => {
    let loader: RepositoryBase = {} as RepositoryBase;
    beforeEach(() => {
        loader = useAPILoader({
            repo: LilithRepo.NHentai,
            configurations: {
                headers: cookies,
                fetchImpl: () => fetchMock({}, TextMocksForDomParser.Search),
                debug,
            },
        });
    });

    test("Custom fetch for JSON", async () => {
        const res = await loader.getChapter("480154");

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
            },
        });
        const res = await randomLoader.randomBook();

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
