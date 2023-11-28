import { beforeEach, describe, expect, test } from "@jest/globals";

import { useLilithLog } from "../../src/repo/utils/log";
import { useAPILoader } from "../../src/api/loader";

import { LilithRepo } from "../../src/interfaces";
import {
    SearchResult,
    RepositoryBase,
    Book,
    Chapter,
    BookBase,
    BookListResults,
} from "../../src/repo/base/interfaces";

const debug = false;
const { log } = useLilithLog(debug);

const SmallBookId = "b5973113-d74f-41be-a97f-64bf315836f3";
const TestChapterId = "940f02a3-c4dc-4cc2-9275-5906fcbdb453";

describe("Lilith", () => {
    describe("Test MangaDex ", () => {
        let loader: RepositoryBase = {} as RepositoryBase;
        beforeEach(() => {
            loader = useAPILoader({
                repo: LilithRepo.MangaDex,
                config: { options: { debug } },
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
            const search: SearchResult = await loader.search("test");
            log(search);
            log(search.results.map((res) => res.cover));
            log(search.results.map((res) => res.availableLanguages));
            expect(search.results[0].cover.uri).toBeTruthy();
            expect(search).toBeDefined();

            const search2: SearchResult = await loader.search("touhou", {
                page: 2,
                size: 3,
            });
            log(search2);
            expect(search2).toBeDefined();
        });

        test("GetBook", async () => {
            const book: Book = await loader.getBook(SmallBookId);
            log(book);
            log(book.availableLanguages);
            expect(book).toBeDefined();
        });

        test("GetChapter", async () => {
            const chapter: Chapter = await loader.getChapter(TestChapterId);
            log(chapter);
            expect(chapter).toBeDefined();
        });

        test("GetLatestBooks", async () => {
            if (!loader.getLatestBooks) return;
            const page: BookListResults = await loader.getLatestBooks(1);
            log(page.results.map((result) => result.availableLanguages));
            log(page.results.map((result) => result.cover.uri));
            expect(page).toBeDefined();
        });

        test("GetTrendingBooks", async () => {
            if (!loader.getTrendingBooks) return;
            const page: BookBase[] = await loader.getTrendingBooks();
            //log(page.map((result) => result.title));
            expect(page).toBeDefined();
        });

        test("GetImageListFromFirstChapter", async () => {
            const book: Book = await loader.getBook(SmallBookId);
            log(book);
            expect(book).toBeDefined();
            if (!book) return null;

            const chapter: Chapter = await loader.getChapter(
                book?.chapters[0].id,
            );
            log(chapter);
            expect(chapter).toBeDefined();
        });
    });
});
