import { ReducersMapObject, createStore, combineReducers } from "redux";

import * as fromDevices from "./devices";
import * as fromMetadata from "./metadata";
import * as fromPreferences from "./preferences";
import * as fromSession from "./session";

export interface State {
    devices: fromDevices.State;
    metadata: fromMetadata.State;
    preferences: fromPreferences.State;
    session: fromSession.State;
}

export const actions = {
    devices: fromDevices.actions,
    metadata: fromMetadata.actions,
    preferences: fromPreferences.actions,
    state: fromSession.actions,
};

const reducers: ReducersMapObject = {
    ...fromDevices.reducers,
    ...fromMetadata.reducers,
    ...fromPreferences.reducers,
    ...fromSession.reducers,
};

// XXX dev tools not used
export const store = createStore<State, any, {}, {}>(
    combineReducers(reducers),
    undefined,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
        (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);
