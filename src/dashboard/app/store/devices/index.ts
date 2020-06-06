import { ReducersMapObject } from "redux";

import { devices } from "./reducers";
import { set, remove } from "./actions";

export { State } from "./reducers";

export const reducers: ReducersMapObject = {
    devices,
};

export const actions = {
    set,
    remove,
};
