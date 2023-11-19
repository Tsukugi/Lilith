import { beforeEach, describe, expect, test } from "@jest/globals";

import { TextMocksForDomParser, cookies, fetchMock } from "../nhentaiMock";
import { useLilithLog } from "../../src/repo/utils/log";
import { useCheerioDomParser } from "../../src/impl/useCheerioDomParser";
import { useAPILoader } from "../../src/api/loader";

import { LilithRepo } from "../../src/interfaces";
import {
    Book,
    Pagination,
    SearchResult,
    RepositoryBase,
} from "../../src/interfaces/base";
import { useNodeFetch } from "../../src/impl/useNodeFetch";
const debug = true;
const { log } = useLilithLog(debug);

describe("Lilith", () => {
    describe("Test nhentai ", () => {
        let loader: RepositoryBase = {} as RepositoryBase;
        beforeEach(() => {
            loader = useAPILoader({
                repo: LilithRepo.NHentai,
                configurations: {
                    headers: cookies,
                    domParser: useCheerioDomParser,
                    fetch: useNodeFetch,
                    debug,
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
            const book: Book = await loader.getBook("482151");
            log(book);
            expect(book).toBeDefined();
        });
        test("Search", async () => {
            const search: SearchResult = await loader.search("atago");
            log(search.results.map((result) => result.cover.uri));
            expect(search.results[0].cover.uri).toBeTruthy();
            expect(search).toBeDefined();
        });
        test("Paginate", async () => {
            if (!loader.paginate) return;
            const page: Pagination = await loader.paginate(1);
            log(page.results.map((result) => result.availableLanguages));
            log(page.results.map((result) => result.cover.uri));
            expect(page).toBeDefined();
        });
        test("RandomBook", async () => {
            const randomLoader = useAPILoader({
                repo: LilithRepo.NHentai,
                configurations: {
                    headers: cookies,
                    fetch: () => fetchMock({}, TextMocksForDomParser.Random),
                    domParser: useCheerioDomParser,
                },
            });
            const book: Book = await randomLoader.randomBook();
            log(book);
            expect(book).toBeDefined();
        });
    });
});
