import { beforeEach, describe, expect, test } from "@jest/globals";

import { useAPILoader } from "../../src/api/loader";

import { RepositoryBase } from "../../src/repo/base/interfaces";
import { LilithRepo } from "../../src/interfaces";

import { headers, TextMocksForDomParser, fetchMock } from "../nhentaiMock";
import { useLilithLog } from "../../src/repo/utils/log";
const debug = false;
const { log, warn } = useLilithLog(debug);

describe("DOMLoader", () => {
    let loader: RepositoryBase = {} as RepositoryBase;
    beforeEach(() => {
        loader = useAPILoader({
            repo: LilithRepo.NHentai,
            config: {
                headers,
                fetch: () => fetchMock({}, TextMocksForDomParser.Search),
                options: { debug },
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
            config: {
                headers,
                fetch: () => fetchMock({}, TextMocksForDomParser.Random),
            },
        });
        const res = await randomLoader.getRandomBook();

        if (res === null)
            warn("[Custom fetch for JSON] Resource was not found");

        log(res);
        expect(res).toBeDefined();
    });

    test("Custom fetch for text", async () => {
        const res = await loader.search("ass");

        if (res === null)
            warn("[Custom fetch for JSON] Resource was not found");

        log(res);
        expect(res).toBeDefined();
    });
});
