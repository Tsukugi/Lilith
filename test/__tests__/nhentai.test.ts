import { beforeEach, describe, expect, test } from "@jest/globals";

import { TextMocksForDomParser, cookies, fetchMock } from "../nhentaiMock";
import { useLilithLog } from "../testLogs";
import { useCheerioDomParser } from "../../src/impl/useCheerioDomParser";
import { useAPILoader } from "../../src/api/loader";

import { LilithRepo } from "../../src/interfaces";
import {
    Book,
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

        test("Request", async () => {
            const res = await loader.request(
                "https://nhentai.net/search?q=ass&sort=recent&page=1",
            );
            log(res);
            expect(res).toBeDefined();
        });
        test("getBook", async () => {
            const book: Book | null = await loader.getBook("ass");
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

            const book2: Book | null = await loader2.getBook("ass");
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
            if (!loader.paginate) return;
            const page: Pagination | null = await loader.paginate(1);
            log(page);
            log(page.results.map((result) => result.cover));
            expect(page).toBeDefined();
        });
        test("RandomBook", async () => {
            const randomLoader = useAPILoader({
                repo: LilithRepo.NHentai,
                configurations: {
                    headers: cookies,
                    fetchImpl: () =>
                        fetchMock({}, TextMocksForDomParser.Random),
                    domParser: useCheerioDomParser,
                },
            });
            const book: Book | null = await randomLoader.randomBook();
            log(book);
            expect(book).toBeDefined();
        });
    });
});
