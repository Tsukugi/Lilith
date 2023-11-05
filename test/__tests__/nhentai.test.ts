import { describe, expect, test } from "@jest/globals";

import { useAPILoader } from "./../../src/index";
import { LilithRepo } from "../../src/interfaces";
import { Book } from "../../src/interfaces/base";
import { cookies } from "../setupTests";

describe("Lilith", () => {
    describe("Test nhentai ", () => {
        test("Get", async () => {
            const loader = useAPILoader(LilithRepo.NHentai, cookies);

            const book: Book | null = await loader.get("ass");

            expect(book).toBeDefined();
        });
    });
});
