import { ReducersMapObject } from "redux";

import { preferences } from "./reducers";
import {
    set,
    upsert,
    remove,
    deepdiveInstanceRemove,
    deepdiveInstanceUpsert,
    optionalPollerRemove,
    optionalPollerUpsert,
} from "./actions";

export { State } from "./reducers";

export const reducers: ReducersMapObject = {
    preferences,
};

export const actions = {
    set,
    upsert,
    remove,
    deepdiveInstanceRemove,
    deepdiveInstanceUpsert,
    optionalPollerRemove,
    optionalPollerUpsert,
};
