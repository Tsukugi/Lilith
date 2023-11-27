import { Chapter, GetChapter } from "../../base/interfaces";
import { LilithError } from "../../base";
import { useLilithLog } from "../../utils/log";
import { UseMethodProps } from "../interfaces";

/**
 * Hook for interacting with NHentai chapters.
 * @param {UseMethodProps} props - Properties required for the hook.
 * @returns {GetChapter} - A function that retrieves information about a chapter based on its identifier.
 */
export const useGetChapterMethod = (props: UseMethodProps): GetChapter => {
    const {
        domains: { apiUrl },
        debug,
        request,
    } = props;

    return async (chapterId: string): Promise<Chapter> => {
        const response = await request(`${apiUrl}/gallery/${chapterId}`);

        if (!response || response?.statusCode !== 200) {
            throw new LilithError(response?.statusCode, "No chapter found");
        }

        const book = await response.json();

        useLilithLog(debug).log({
            book,
        });

        return null;
    };
};
