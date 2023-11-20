import { LilithError } from "../../interfaces/base";
import { MaxSearchSize } from "../base";

interface UseRangeFinderProps {
    pageSize?: number;
}
export const useRangeFinder = (props: UseRangeFinderProps) => {
    const { pageSize } = { pageSize: MaxSearchSize, ...props };

    /**
     * Converts a simple page input to indexes
     * @param page
     * @returns
     */
    const pageToRange = (page: number) => {
        if (page <= 0) {
            throw new LilithError(400, "Page number should be greater than 0.");
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize - 1;

        return {
            startIndex,
            endIndex,
        };
    };

    /**
     * Retrieves the pages that should be used from specific indexes
     * @param startIndex
     * @param endIndex
     * @returns An array of pages [2, 3], it means to use page 2 and 3
     */
    const rangeToPagination = (
        startIndex: number,
        endIndex: number,
    ): number[] => {
        if (startIndex < 0 || endIndex < startIndex || pageSize <= 0) {
            throw new Error("Invalid range or pageSize.");
        }

        const startPage = Math.floor(startIndex / pageSize) + 1;
        const endPage = Math.floor(endIndex / pageSize) + 1;

        const pagination = [];
        for (let i = startPage; i <= endPage; i++) {
            pagination.push(i);
        }

        return pagination;
    };

    return { pageToRange, rangeToPagination };
};
