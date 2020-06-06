import { CONFIG_SET, CONFIG_UNSET } from "./actions";

export interface State {
    store: { key: string; value: any }[];
}

const initialState: State = {
    store: [],
};

export function config(state = initialState, action: any): State {
    switch (action.type) {
        case CONFIG_SET:
            return {
                ...state,
                store: [
                    ...state.store.filter(
                        (entry) => entry.key !== action.payload.key
                    ),
                    action.payload,
                ],
            };

        case CONFIG_UNSET:
            return {
                ...state,
                store: [
                    ...state.store.filter(
                        (entry) => entry.key !== action.payload.key
                    ),
                ],
            };

        default:
            return state;
    }
}
