import { beforeEach, describe, expect, test } from "@jest/globals";

import { useLilithLog } from "../../src/repo/log";
import { useAPILoader } from "../../src/api/loader";

import { LilithRepo } from "../../src/interfaces";
import {
    SearchResult,
    RepositoryBase,
    Book,
    Chapter,
} from "../../src/interfaces/base";

const debug = false;
const { log } = useLilithLog(debug);

describe("Lilith", () => {
    describe("Test MangaDex ", () => {
        let loader: RepositoryBase = {} as RepositoryBase;
        beforeEach(() => {
            loader = useAPILoader({
                repo: LilithRepo.MangaDex,
                configurations: {
                    debug,
                },
            });
        });
        test("Errors", async () => {
            try {
                const chapter: Chapter = await loader.getChapter(
                    "adwadaawdadwadwad",
                );
                expect(chapter).toThrow();
            } catch (error) {
                log(error);
            }
            try {
                const search: SearchResult = await loader.search(
                    "adwadaawdadwadwad",
                );
                expect(search).toThrow();
            } catch (error) {
                log(error);
            }
        });

        test("Search", async () => {
            const search: SearchResult = await loader.search("komi");
            log(search);
            log(search.results.map((res) => res.cover));
            expect(search.results[0].cover.uri).toBeTruthy();
            expect(search).toBeDefined();
        });

        test("GetBook", async () => {
            const book: Book = await loader.getBook(
                "b5973113-d74f-41be-a97f-64bf315836f3",
            );
            log(book);
            expect(book).toBeDefined();
        });

        test("GetChapter", async () => {
            const chapter: Chapter = await loader.getChapter(
                "940f02a3-c4dc-4cc2-9275-5906fcbdb453",
            );
            log(chapter);
            expect(chapter).toBeDefined();
        });

        test("GetImageListFromFirstChapter", async () => {
            const book: Book = await loader.getBook(
                "b5973113-d74f-41be-a97f-64bf315836f3",
            );
            log(book);
            expect(book).toBeDefined();
            if (!book) return null;

            const chapter: Chapter = await loader.getChapter(book?.chapters[0]);
            log(chapter);
            expect(chapter).toBeDefined();
        });
    });
});
