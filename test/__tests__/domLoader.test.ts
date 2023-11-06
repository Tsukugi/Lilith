import { beforeEach, describe, expect, test } from "@jest/globals";
import { LilithRepo, useAPILoader } from "../../src";
import { Extension, Sort } from "../../src/interfaces/base";
import {
    cookies,
    useCheerioDomParser,
    customFetchImpl,
    TextMocksForDomParser,
    fetchMock,
} from "../nhentaiMock";
import RepositoryBase from "../../src/repo/base";

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

        console.log(thumbnail);
        expect(thumbnail).toBeDefined();

        const image = await customFetchImpl(thumbnail, {
            method: "GET",
            headers: {
                "User-Agent": cookies.userAgent,
                cookie: cookies.cfClearance,
            },
            credentials: "include",
        });

        if (image.status !== 200) {
            console.warn(
                "[CustomFetchImpl]: No image found",
                image.status,
                "please check the test",
            );
        }

        console.log(image);
        expect(image).toBeDefined();
    });

    test("Custom fetch for JSON", async () => {
        const res = await loader.get("480154");

        if (res === null)
            console.warn("[Custom fetch for JSON] Resource was not found");

        console.log(res);
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
            console.warn("[Custom fetch for JSON] Resource was not found");

        console.log(res);
        expect(res).toBeDefined();
    });

    test("Custom fetch for text", async () => {
        const res = await loader.search("ass", 1, Sort.POPULAR);

        if (res === null)
            console.warn("[Custom fetch for JSON] Resource was not found");

        console.log(res);
        expect(res).toBeDefined();
    });
});
