import { beforeEach, describe, expect, test } from "@jest/globals";

import { cookies } from "../nhentaiMock";
import { useLilithLog } from "../testLogs";
import { useCheerioDomParser } from "../../src/impl/useCheerioDomParser";
import { useAPILoader } from "../../src/api/loader";

import { LilithRepo } from "../../src/interfaces";
import {
    SearchResult,
    Sort,
    RepositoryBase,
    Book,
    Chapter,
} from "../../src/interfaces/base";
import { useNodeFetch } from "../../src/impl/useNodeFetch";

const { log } = useLilithLog(true);

describe("Lilith", () => {
    describe("Test MangaDex ", () => {
        let loader: RepositoryBase = {} as RepositoryBase;
        beforeEach(() => {
            loader = useAPILoader({
                repo: LilithRepo.MangaDex,
                configurations: {
                    headers: cookies,
                    fetchImpl: useNodeFetch,
                    domParser: useCheerioDomParser,
                },
            });
        });

        test("Search", async () => {
            const search: SearchResult | null = await loader.search(
                "komi",
                2,
                Sort.POPULAR_WEEK,
            );
            log(search);
            log(search.results.map((res) => res.cover));
            //  warn(search.results.map((result) => result.cover));
            expect(search.results[0].cover.uri).toBeTruthy();
            expect(search).toBeDefined();
        });

        test("GetBook", async () => {
            const get: Book | null = await loader.getBook(
                "b5973113-d74f-41be-a97f-64bf315836f3",
            );
            log(get);
            expect(get).toBeDefined();
        });

        test("GetChapter", async () => {
            const chapter: Chapter | null = await loader.getChapter(
                "940f02a3-c4dc-4cc2-9275-5906fcbdb453",
            );
            log(chapter);
            expect(chapter).toBeDefined();
        });
    });
});
