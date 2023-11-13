import { AnyNode, Cheerio, load } from "cheerio/lib/slim";
import { UseDomParser, UseDomParserImpl } from "../interfaces/domParser";

export const useCheerioDomParser: UseDomParser = (stringDom: string) => {
    const $ = load(stringDom);

    const parser = (el: Cheerio<AnyNode>): UseDomParserImpl => {
        const find = (query: string) => {
            const findRes = el.find(query).first();
            return findRes ? parser(findRes) : null;
        };
        const findAll = (query: string) =>
            el
                .find(query)
                .map((_, element) => parser($(element)))
                .get();

        const getText = () => el.text() || "";
        const getAttribute = (key: string) => el.attr(key) || null;

        return { find, findAll, getAttribute, getText };
    };

    return parser($("html"));
};
