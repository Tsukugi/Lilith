const findCommonElements = <T>(array1: T[], array2: T[]): T[] => {
    return array1.filter((element) => array2.includes(element));
};

export const ArrayUtils = {
    findCommonElements,
};
