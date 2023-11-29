## How to extend Lilith

This project is thought to be extended with more sources, to achieve that, we need to create a new repository and then attach it to the Lilith API Loader

### Using a template

It is highly recommended to use the template in `src/repo/template`, as it has already mostly everything done for the structure.

First of all define a name of the Repository, this name should be used to name files, folders, and to identify the repository.

For example, instead of `RepositoryName` we will be using, using `NHentaiTest`, please use the correct name for your repository.

Then, let's create a copy of that folder to `src/repo/NHentaiTest`, for example this command will do it for you in `bash`

```bash
cp -r ./src/repo/template ./src/repo/NHentaiTest
```

Then in that folder we have an `index.ts`, and two folders, `interfaces` and `methods`.

-   _Interfaces_: Please define your repository typescript interfaces here. As they ONLY will affect your repository only.
-   _Methods_: Inside this folder we find implementation functions for every method that is required in Lilith, most of the work will be done here. There is a `base.ts` file, this file should provide some pure functions specific only to your repository, like LanguageMappers or shared DOM scrappers, feel free to define any function that you want to reuse between your methods.
    Always think of tests in mind, so keep the functions easily testeable and simple.
-   _index.ts_: Here is where we put everything together, also we can define some methods that are heavy on dependencies, like requests, but it's purpose is to mainly give a structure following `RepositoryTemplate` interface, using the methods that we wrote on the `Methods` folder.

A really simple implementation of the main function would be

```ts
/**
 * A template for creating a test repository for the NHentaiTest API/Webpage.
 * @param {RepositoryBaseProps} props - The properties required for creating the repository.
 * @returns {RepositoryBase} - The created repository with base methods.
 */
export const useNHentaiTestRepository: RepositoryTemplate = (props) => {
    /**
     * Destructuring properties from the input.
     */
    const { headers } = props;

    /**
     * Using the `useRequest` hook to get the `doRequest` function.
     * This is a Lilith method to make request that would provide
     * json or document, using Lilith's fetch and domParser implementations.
     */
    const { doRequest } = useRequest(props);

    /**
     * Base URLs for the test repository.
     */
    const baseUrl = "https://someTest.url";
    const apiUrl = "https://someTest.url/api";
    const imgBaseUrl = "https://i.someTest.url/galleries";
    const tinyImgBaseUrl = "https://t.someTest.url/galleries";

    /**
     * Wrapper function for making requests with necessary headers.
     * @template T - The type of the expected result.
     * @param {string} url - The URL for the request.
     * @param {UrlParamPair[]} [params=[]] - An array of URL parameters.
     * @returns {Promise<Result<T>>} - A promise that resolves to the result of the request.
     * @throws {LilithError} - Throws an error if required headers are missing.
     */
    const request = async <T>(
        url: string,
        params: UrlParamPair[] = [],
    ): Promise<Result<T>> => {
        if (!headers || !headers["User-Agent"] || !headers.cookie) {
            throw new LilithError(403, "Test error");
        }
        /**
         * Please check CustomFetchInitOptions interface for more info on requestOptions
         */
        const requestOptions: CustomFetchInitOptions = {
            method: "GET",
            headers,
            credentials: "include",
        };

        return doRequest(url, params, requestOptions);
    };

    /**
     * Object containing domain URLs for the repository.
     */
    const domains = { baseUrl, imgBaseUrl, apiUrl, tinyImgBaseUrl };

    /**
     * Properties needed for repository methods.
     */
    const methodProps: UseNHentaiTestMethodProps = {
        ...props,
        domains,
        request,
    };

    /**
     * Returns an object representing the NHentai repository with base methods.
     * Also note that the names of the methods should have the repository name on them.
     */
    return {
        domains,
        getChapter: useNHentaiTestGetChapterMethod(methodProps),
        getBook: useNHentaiTestGetBookmethod(methodProps),
        search: useNHentaiTestSearchMethod(methodProps),
        getRandomBook: useNHentaiTestGetRandomBookMethod(methodProps),
        getLatestBooks: useNHentaiTestGetLatestBooksMethod(methodProps),
        getTrendingBooks: useNHentaiTestGetTrendingBooksMethod(methodProps),
    };
};
```

And here is a example of the `getBook` method

```ts
/**
 * Hook for interacting with NHentaiTest books.
 * @param {UseNHentaiTestMethodProps} props - Properties required for the hook.
 * @returns {GetBook} - A function that retrieves information about a book based on its identifier.
 */
export const useNHentaiTestGetBookmethod = (
    props: UseNHentaiTestMethodProps,
): GetBook => {
    const {
        domains: { apiUrl },
        options: { debug },
        request,
    } = props;

    /*
     * Here we use our base.ts methods.
     */
    const { LanguageMapper, getLanguageFromTags, getImageUri } =
        useNHentaiMethods();

    return async (
        id: string,
        requiredLanguages: LilithLanguage[] = Object.values(LilithLanguage),
    ): Promise<Book> => {
        /**
         * Make a request using the method in the props, it accepts a return type
         * so please add it whenever possible.
         */
        const response = await request<NHentaiResult>(
            `${apiUrl}/gallery/${id}`,
        );

        /**
         * This way we get the JSON data from the response
         */
        const book: NHentaiResult = await response.json();

        /**
         * This way we get the DOMParser data from the response
         */
        const document: UseDomParserImpl = await response.getDocument();

        /**
         * This way we can use the debug flag from the loader to
         * log values, and still be able to disable them.
         */
        useLilithLog(debug).log({
            book,
        });

        const Book: Book = {
            /* ... map your properties to Lilith interfaces */
        };

        return Book;
    };
};
```

### Fetch and DomParser

You may have noticed that we don't directly use `fetch`, `axios` or `cheerio`, we leverage this part to the consumer of the API.

We have an agnostic environment with Lilith `CustomFetch` and `UseDomParserImpl`.

Here is an snippet of the structure of `fetch` interface:

```ts
// Result of the request method
export interface Result<T> {
    statusCode: number;
    json: () => Promise<T>;
    getDocument: () => Promise<UseDomParserImpl>;
}

// In the inside uses this structure
export type CustomFetch = (
    url: string,
    options: Partial<CustomFetchInitOptions>,
) => Promise<CustomFetchResponse>;
```

And here is for the `DOMParser`

```ts
// Result of getDocument method
export interface UseDomParserImpl {
    /**
     * The query should follow the common conventions of document.querySelector or Cheerio
     */
    find: (query: string) => UseDomParserImpl | null;
    findAll: (query: string) => UseDomParserImpl[];
    getText: () => string;
    getAttribute: (key: string) => string | null;
}
```

### Adding the new repository to the loader

Once you are finished we need to simply using the new repository in the loader.

So let's add an entry in `src/repo/`

```ts
// in src/interfaces/index.ts

export enum LilithRepo {
    /* ... Already supported entries */
    NHentaiTest = "NHentaiTest",
}
```

Once you add an entry there, we allow users to choose this repo when they use the loader.

Now we need to support it in the loader itself, please add the following:

```ts
switch (repo) {
    case LilithRepo.NHentaiTest:
        return useNHentaiTestRepository(innerConfigurations);
    /* ...rest of the options */
}
```

Basically we are done, but we need one final step, we need to export our main function, for users that want to use your Repository implementation without any loader.

```ts
export { useNHentaiTestRepository } from "./repo/NHentaiTest";
```

### RepositoryTemplate interfaces

Basically each repository implementation has to follow the type `RepositoryTemplate`.

These are some of the interfaces that we need to fulfill:

```ts
// This is from src/repo/base/interfaces/index.ts

export interface RepositoryBase {
    /**
     * Retrieves a chapter based on its identifier.
     * @param {string} identifier - The unique identifier of the chapter.
     * @returns {Promise<Chapter>} - A Promise that resolves to the retrieved chapter.
     */
    getChapter: GetChapter;

    /**
     * Retrieves a book based on its identifier and optional required languages.
     * @param {string} identifier - The unique identifier of the book.
     * @param {LilithLanguage[]} [requiredLanguages] - Optional array of required languages.
     * @returns {Promise<Book>} - A Promise that resolves to the retrieved book.
     */
    getBook: GetBook;

    /**
     * Searches for books based on a query and optional search options.
     * @param {string} query - The search query.
     * @param {Partial<SearchQueryOptions>} [options] - Optional search query options.
     * @returns {Promise<SearchResult>} - A Promise that resolves to the search result.
     */
    search: Search;

    /**
     * Retrieves a random book.
     * @param {number} [retry] - Optional parameter to specify the number of retry attempts.
     * @returns {Promise<Book>} - A Promise that resolves to the randomly retrieved book.
     */
    getRandomBook: GetRandomBook;

    /**
     * Retrieves the latest books based on the specified page.
     * @param {number} page - The page number.
     * @returns {Promise<BookListResults>} - A Promise that resolves to the information for the latest books.
     */
    getLatestBooks: GetLatestBooks;

    /**
     * Retrieves a list of trending books.
     * @returns {Promise<BookBase[]>} - A Promise that resolves to the list of trending books.
     */
    getTrendingBooks: GetTrendingBooks;
}

export type RepositoryTemplate = (props: RepositoryBaseProps) => RepositoryBase; //* This one
```

Please check the file for more details on props or related interfaces.

## Jest Unit Tests

One last thing to note are the tests, currently they are working with Jest, but they aren't as extensive nor strict as I would like. If you want to help on this, it would be awesome too.

--- More documentation for tests comming soon!
