import { ReducersMapObject } from "redux";

import { devices } from "./reducers";
import {
    add,
    remove,
    bulkRemove,
    incPolling,
    decPolling,
    setError,
    disable,
    enable,
} from "./actions";

export { State } from "./reducers";

export const reducers: ReducersMapObject = {
    devices,
};

export const actions = {
    add,
    remove,
    bulkRemove,
    incPolling,
    decPolling,
    setError,
    enable,
    disable,
};
