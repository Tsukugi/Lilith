import { describe, expect, test } from "@jest/globals";
import { useLilithLog } from "../../../src/repo/utils/log";
import { RequestUtils } from "../../../src/repo/utils/request";

const debug = false;
const { log } = useLilithLog(debug);

describe("RequestUtils", () => {
    test("useParamIfExists", () => {
        const param = {
            test: true,
            test2: false,
        };
        const res = RequestUtils.useParamIfExists("test", param.test);

        log(res);
        expect(res).toEqual("test=true");

        const res2 = RequestUtils.useParamIfExists(
            "test",
            param["undefinedProp"],
        ); // Doesnt exist

        log(res2);
        expect(res2).toEqual("");

        const res3 = RequestUtils.useParamIfExists("test2", param.test2);

        log(res3);
        expect(res3).toEqual("test2=false");
    });

    test("useUrlWithParams", async () => {
        const res = RequestUtils.useUrlWithParams("https://test/demo", [
            ["test", true],
            ["test2", false],
            ["test3", "asd"],
        ]);

        log(res);
        expect(res).toEqual(
            "https://test/demo?test=true&test2=false&test3=asd",
        );
    });
});
