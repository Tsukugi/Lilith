export interface ElementProps {
    textContent: string;
    attributes: Partial<ElementAttributes>;
}

export interface ElementAttributes {
    href: string;
    src: string;
    "data-src": string;
    width: number;
    height: number;
}

export interface UseDomParserImpl {
    find: (query: string) => UseDomParserImpl | null;
    findAll: (query: string) => UseDomParserImpl[];
    getElement: () => ElementProps;
}

export type UseDomParser = (stringDom: string) => UseDomParserImpl;

export const useDefaultDomParser: UseDomParser = (
    stringDom,
): UseDomParserImpl => {
    const element = new DOMParser().parseFromString(stringDom, "text/html");

    const parser = (el) => {
        const find = (query) => {
            const selectedElement = el.querySelector(query);
            return parser(selectedElement);
        };
        const findAll = (query) =>
            Array.from(el.querySelectorAll(query)).map((el) => parser(el));

        return { find, findAll, getElement: () => el };
    };

    return parser(element);
};
