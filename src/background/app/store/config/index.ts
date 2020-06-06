import { ReducersMapObject } from "redux";

import { config } from "./reducers";
import { set, unset } from "./actions";

export { State } from "./reducers";

export const reducers: ReducersMapObject = {
    config,
};

export const actions = {
    set,
    unset,
};
