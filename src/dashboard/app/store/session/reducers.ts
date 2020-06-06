import { SESSION_UPSERT, SESSION_REMOVE } from "./actions";

export type State = Array<{ key: string; value: any }>;

const initialState: State = [];

export function session(state = initialState, action: any): State {
    switch (action.type) {
        case SESSION_UPSERT:
            return [
                ...state.filter(({ key, value }) => key !== action.payload.key),
                action.payload,
            ];

        case SESSION_REMOVE:
            return [
                ...state.filter(({ key, value }) => key !== action.payload.key),
            ];

        default:
            return state;
    }
}
