import { ReducersMapObject, createStore, combineReducers } from "redux";

import * as fromConfig from "./config";
import * as fromDevices from "./devices";
import * as fromMetadata from "./metadata";

export interface State {
    config: fromConfig.State;
    devices: fromDevices.State;
    metadata: fromMetadata.State;
}

export const actions = {
    config: fromConfig.actions,
    devices: fromDevices.actions,
    metadata: fromMetadata.actions,
};

const reducers: ReducersMapObject = {
    ...fromConfig.reducers,
    ...fromDevices.reducers,
    ...fromMetadata.reducers,
};

export const store = createStore<State, any, {}, {}>(
    combineReducers(reducers),
    undefined,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
        (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);
