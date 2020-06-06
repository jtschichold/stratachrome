import { ReducersMapObject } from "redux";

import { metadata } from "./reducers";
import { setPreferences, setOptionalPollers } from "./actions";

export { State } from "./reducers";

export const reducers: ReducersMapObject = {
    metadata,
};

export const actions = {
    setPreferences,
    setOptionalPollers,
};
