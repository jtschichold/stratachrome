import { ReducersMapObject } from "redux";

import { metadata } from "./reducers";
import { setTemplates, setOptionalPollers } from "./actions";

export { State } from "./reducers";

export const reducers: ReducersMapObject = {
    metadata,
};

export const actions = {
    setTemplates,
    setOptionalPollers,
};
