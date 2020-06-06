import { createSelectorCreator, defaultMemoize } from "reselect";

const almostShallowEqualityCheck = (current: any, prev: any) => {
    if (Array.isArray(current) && Array.isArray(prev)) {
        if (current.length !== prev.length) return false;

        let check = current
            .map((ci) => prev.find((pi) => pi === ci))
            .filter(Boolean);
        return check.length === current.length;
    }

    return current === prev;
};

export const createAlmostShallowSelector = createSelectorCreator(
    defaultMemoize,
    almostShallowEqualityCheck
);
