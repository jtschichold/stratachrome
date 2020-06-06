import { ReducersMapObject } from "redux";

import { session } from "./reducers";
import { upsert, remove } from "./actions";

export { State } from "./reducers";

export const reducers: ReducersMapObject = {
    session,
};

export const actions = {
    upsert,
    remove,
};
