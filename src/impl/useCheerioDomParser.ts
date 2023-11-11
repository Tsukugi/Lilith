import { AnyNode, Cheerio, load } from "cheerio/lib/slim";
import {
    ElementAttributes,
    ElementProps,
    UseDomParser,
    UseDomParserImpl,
} from "../interfaces/domParser";

export const useCheerioDomParser: UseDomParser = (stringDom: string) => {
    const $ = load(stringDom);

    const parser = (el: Cheerio<AnyNode>): UseDomParserImpl => {
        const find = (query: string) => parser(el.find(query).first());
        const findAll = (query: string) =>
            el
                .find(query)
                .map((_, element) => parser($(element)))
                .get();
        const getElement = (): ElementProps => {
            const attributes: Partial<ElementAttributes> = {
                href: el.attr("href") || "",
                "data-src": el.attr("data-src") || "",
                width: parseInt(el.attr("width") || "0", 10),
                height: parseInt(el.attr("height") || "0", 10),
            };
            return {
                textContent: el.text(),
                attributes,
            };
        };

        return { find, findAll, getElement };
    };

    return parser($("html"));
};
