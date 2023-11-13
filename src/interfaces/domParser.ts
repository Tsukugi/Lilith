export interface UseDomParserImpl {
    find: (query: string) => UseDomParserImpl | null;
    findAll: (query: string) => UseDomParserImpl[];
    getText: () => string;
    getAttribute: (key: string) => string | null;
}

export type UseDomParser = (stringDom: string) => UseDomParserImpl;
