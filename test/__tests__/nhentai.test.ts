import { beforeEach, describe, expect, test } from "@jest/globals";

import { TextMocksForDomParser, cookies, fetchMock } from "../nhentaiMock";
import { useLilithLog } from "../testLogs";
import { useCheerioDomParser } from "../../src/impl/useCheerioDomParser";
import { useAPILoader } from "../../src/api/loader";

import { LilithRepo } from "../../src/interfaces";
import {
    Book,
    Extension,
    Pagination,
    SearchResult,
    Sort,
    RepositoryBase,
} from "../../src/interfaces/base";

const { log, warn } = useLilithLog(false);

describe("Lilith", () => {
    describe("Test nhentai ", () => {
        let loader: RepositoryBase = {} as RepositoryBase;
        beforeEach(() => {
            loader = useAPILoader({
                repo: LilithRepo.NHentai,
                configurations: {
                    headers: cookies,
                    //fetchImpl: useNodeFetch,
                    fetchImpl: () => fetchMock(),
                    domParser: useCheerioDomParser,
                },
            });
        });
        test("getUri", () => {
            const cover: string = loader.getUri("cover", "ass", Extension.g, 0);
            log(cover);
            expect(cover).toEqual(
                "https://t.nhentai.net/galleries/ass/cover.gif",
            );

            const thumbnail: string = loader.getUri(
                "thumbnail",
                "thisisalibrary",
                Extension.j,
                0,
            );
            log(thumbnail);
            expect(thumbnail).toEqual(
                "https://t.nhentai.net/galleries/thisisalibrary/thumb.jpg",
            );

            const page: string = loader.getUri(
                "page",
                "someInterestingBook",
                Extension.p,
                69,
            );
            log(page);
            expect(page).toEqual(
                "https://i.nhentai.net/galleries/someInterestingBook/69.png",
            );
        });
        test("Request", async () => {
            const res = await loader.request(
                "https://nhentai.net/search?q=ass&sort=recent&page=1",
            );
            log(res);
            expect(res).toBeDefined();
        });
        test("Get", async () => {
            const book: Book | null = await loader.get("ass");
            log(book);
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
            log(book2);
            expect(book2).toBeNull();
        });
        test("Search", async () => {
            const search: SearchResult | null = await loader.search(
                "atago",
                2,
                Sort.POPULAR_WEEK,
            );
            log(search);
            warn(search.results.map((result) => result.cover));
            expect(search.results[0].cover.uri).toBeTruthy();
            expect(search).toBeDefined();
        });
        test("Paginate", async () => {
            const page: Pagination | null = await loader.paginate(1);
            log(page);
            log(page.results.map((result) => result.cover));
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
            log(book);
            expect(book).toBeDefined();
        });
    });
});
