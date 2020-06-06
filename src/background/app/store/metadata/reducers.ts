import { DevicePreference, OptionalPoller } from "../../../../common/models";

import { PREFERENCE_SET, OPTIONALPOLLER_SET } from "./actions";

export interface State {
    preferences: DevicePreference[];
    optionalPollers: OptionalPoller[];
}

const initialState: State = {
    preferences: [],
    optionalPollers: [],
};

export function metadata(state = initialState, action: any): State {
    switch (action.type) {
        case PREFERENCE_SET:
            return {
                ...state,
                preferences: action.payload.preferences,
            };

        case OPTIONALPOLLER_SET:
            return {
                ...state,
                optionalPollers: action.payload.optionalPollers,
            };

        default:
            return state;
    }
}
