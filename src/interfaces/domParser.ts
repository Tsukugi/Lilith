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
