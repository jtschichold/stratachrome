import { DevicePreference, DeepDiveInstance } from "../../../../common/models";

import {
    PREFERENCE_REMOVE,
    PREFERENCE_UPSERT,
    PREFERENCE_SET,
    PREFERENCE_DD_UPSERT,
    PREFERENCE_DD_REMOVE,
    PREFERENCE_OP_UPSERT,
    PREFERENCE_OP_REMOVE,
} from "./actions";

export interface State {
    preferences: DevicePreference[];
}

const initialState: State = {
    preferences: [],
};

export function preferences(state = initialState, action: any): State {
    switch (action.type) {
        case PREFERENCE_SET:
            return {
                ...state,
                preferences: action.payload.preferences,
            };

        case PREFERENCE_UPSERT:
            return {
                ...state,
                preferences: [
                    ...state.preferences.filter(
                        (p) => p.serial !== action.payload.preference.serial
                    ),
                    action.payload.preference,
                ],
            };

        case PREFERENCE_REMOVE:
            return {
                ...state,
                preferences: state.preferences.filter(
                    (p) => p.serial !== action.payload.serial
                ),
            };

        case PREFERENCE_DD_UPSERT:
            return {
                ...state,
                preferences: [
                    ...state.preferences.filter(
                        (p) => p.serial !== action.payload.serial
                    ),
                    ...preferenceDDUpsertReducer(
                        state,
                        action.payload.serial,
                        action.payload.deepdive
                    ),
                ],
            };

        case PREFERENCE_DD_REMOVE:
            return {
                ...state,
                preferences: [
                    ...state.preferences.filter(
                        (p) => p.serial !== action.payload.serial
                    ),
                    ...preferenceDDRemoveReducer(
                        state,
                        action.payload.serial,
                        action.payload.deepdiveId
                    ),
                ],
            };

        case PREFERENCE_OP_UPSERT:
            return {
                ...state,
                preferences: [
                    ...state.preferences.filter(
                        (p) => p.serial !== action.payload.serial
                    ),
                    ...preferenceOpUpsertReducer(
                        state,
                        action.payload.serial,
                        action.payload.optionalPollerId
                    ),
                ],
            };

        case PREFERENCE_OP_REMOVE:
            return {
                ...state,
                preferences: [
                    ...state.preferences.filter(
                        (p) => p.serial !== action.payload.serial
                    ),
                    ...preferenceOpRemoveReducer(
                        state,
                        action.payload.serial,
                        action.payload.optionalPollerId
                    ),
                ],
            };

        default:
            return state;
    }
}

const preferenceDDUpsertReducer = (
    state: State,
    serial: string,
    deepdive: DeepDiveInstance
): DevicePreference[] => {
    let oldPreference = state.preferences.find((p) => p.serial === serial);
    if (!oldPreference)
        return [
            {
                serial,
                deepdives: [deepdive],
                enabledOptionalPollers: [],
            },
        ];

    return [
        {
            ...oldPreference,
            deepdives: [
                ...oldPreference.deepdives.filter(
                    (ddi) => ddi.id !== deepdive.id
                ),
                deepdive,
            ],
        },
    ];
};

const preferenceDDRemoveReducer = (
    state: State,
    serial: string,
    deepdiveId: string
): DevicePreference[] => {
    let oldPreference = state.preferences.find((p) => p.serial === serial);
    if (!oldPreference) return [];

    return [
        {
            ...oldPreference,
            deepdives: [
                ...oldPreference.deepdives.filter(
                    (ddi) => ddi.id !== deepdiveId
                ),
            ],
        },
    ];
};

const preferenceOpUpsertReducer = (
    state: State,
    serial: string,
    optionalPollerId: string
): DevicePreference[] => {
    let oldPreference = state.preferences.find((p) => p.serial === serial);
    if (!oldPreference)
        return [
            {
                serial,
                enabledOptionalPollers: [optionalPollerId],
                deepdives: [],
            },
        ];

    return [
        {
            ...oldPreference,
            enabledOptionalPollers: [
                ...oldPreference.enabledOptionalPollers.filter(
                    (opid) => opid !== optionalPollerId
                ),
                optionalPollerId,
            ],
        },
    ];
};

const preferenceOpRemoveReducer = (
    state: State,
    serial: string,
    optionalPollerId: string
): DevicePreference[] => {
    let oldPreference = state.preferences.find((p) => p.serial === serial);
    if (!oldPreference) return [];

    return [
        {
            ...oldPreference,
            enabledOptionalPollers: [
                ...oldPreference.enabledOptionalPollers.filter(
                    (opid) => opid !== optionalPollerId
                ),
            ],
        },
    ];
};
