import { describe, expect, test } from "@jest/globals";

import { useAPILoader } from "./../../src/index";
import { LilithRepo } from "../../src/interfaces";
import { Book } from "../../src/interfaces/base";
import { cookies, fetchMock } from "../nhentaiMock";

describe("Lilith", () => {
    describe("Test nhentai ", () => {
        test("Get", async () => {
            const loader = useAPILoader({
                repo: LilithRepo.NHentai,
                config: cookies,
                fetchImpl: fetchMock,
            });

            const book: Book | null = await loader.get("ass"); // Verify that response.json() was not called, as we provided our own JSON response

            expect(book).toBeDefined();
        });
    });
});
