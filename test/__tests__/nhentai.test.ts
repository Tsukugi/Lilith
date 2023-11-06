import { beforeEach, describe, expect, test } from "@jest/globals";

import { useAPILoader } from "./../../src/index";
import { LilithRepo } from "../../src/interfaces";
import {
    Book,
    Extension,
    Pagination,
    SearchResult,
    Sort,
} from "../../src/interfaces/base";
import {
    TextMocksForDomParser,
    cookies,
    fetchMock,
    useCheerioDomParser,
} from "../nhentaiMock";
import RepositoryBase from "../../src/repo/base";

describe("Lilith", () => {
    describe("Test nhentai ", () => {
        let loader: RepositoryBase = {} as RepositoryBase;
        beforeEach(() => {
            loader = useAPILoader({
                repo: LilithRepo.NHentai,
                configurations: {
                    headers: cookies,
                    fetchImpl: () =>
                        fetchMock({}, TextMocksForDomParser.Search),
                    domParser: useCheerioDomParser,
                },
            });
        });
        test("getUri", () => {
            const cover: string = loader.getUri("cover", "ass", Extension.g, 0);
            console.log(cover);
            expect(cover).toEqual(
                "https://t.nhentai.net/galleries/ass/cover.gif",
            );

            const thumbnail: string = loader.getUri(
                "thumbnail",
                "thisisalibrary",
                Extension.j,
                0,
            );
            console.log(thumbnail);
            expect(thumbnail).toEqual(
                "https://t.nhentai.net/galleries/thisisalibrary/thumb.jpg",
            );

            const page: string = loader.getUri(
                "page",
                "someInterestingBook",
                Extension.p,
                69,
            );
            console.log(page);
            expect(page).toEqual(
                "https://i.nhentai.net/galleries/someInterestingBook/69.png",
            );
        });
        test("Get", async () => {
            const book: Book | null = await loader.get("ass");
            console.log(book);
            expect(book).toBeDefined();

            const loader2 = useAPILoader({
                repo: LilithRepo.NHentai,
                configurations: {
                    headers: cookies,
                    fetchImpl: () => fetchMock({ status: 404 }),
                    domParser: useCheerioDomParser,
                },
            });

            const book2: Book | null = await loader2.get("ass");
            console.log(book2);
            expect(book2).toBeNull();
        });
        test("Search", async () => {
            const search: SearchResult | null = await loader.search(
                "atago",
                2,
                Sort.POPULAR_WEEK,
            );
            console.log(search);
            expect(search).toBeDefined();
        });
        test("Paginate", async () => {
            const page: Pagination | null = await loader.paginate(1);
            console.log(page);
            expect(page).toBeDefined();
        });
        test("Random", async () => {
            const randomLoader = useAPILoader({
                repo: LilithRepo.NHentai,
                configurations: {
                    headers: cookies,
                    fetchImpl: () =>
                        fetchMock({}, TextMocksForDomParser.Random),
                    domParser: useCheerioDomParser,
                },
            });
            const book: Book | null = await randomLoader.random();
            console.log(book);
            expect(book).toBeDefined();
        });
    });
});
