import { describe, expect, test } from "@jest/globals";
import { ArrayUtils } from "../../../src/repo/utils/array";
import { useLilithLog } from "../../../src/repo/utils/log";

const debug = false;
const { log } = useLilithLog(debug);

describe("RequestUtils", () => {
    test("findCommonElements", async () => {
        const res = ArrayUtils.findCommonElements(
            ["en", "de", "es"],
            ["zh", "jp", "es"],
        );

        log(res);
        expect(res).toEqual(["es"]);

        const res2 = ArrayUtils.findCommonElements(
            ["en", "de", "es"],
            ["zh", "jp", "kr"],
        );

        log(res2);
        expect(res2).toEqual([]);
    });
});
