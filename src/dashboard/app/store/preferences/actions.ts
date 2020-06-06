import { DevicePreference, DeepDiveInstance } from "../../../../common/models";

export const PREFERENCE_SET: string = "PREFERENCE_SET";
export const PREFERENCE_UPSERT: string = "PREFERENCE_UPSERT";
export const PREFERENCE_REMOVE: string = "PREFERENCE_REMOVE";
export const PREFERENCE_DD_UPSERT: string = "PREFERENCE_DD_UPSERT";
export const PREFERENCE_DD_REMOVE: string = "PREFERENCE_DD_REMOVE";
export const PREFERENCE_OP_UPSERT: string = "PREFERENCE_OP_UPSERT";
export const PREFERENCE_OP_REMOVE: string = "PREFERENCE_OP_REMOVE";

export function set(preferences: DevicePreference[]) {
    return {
        type: PREFERENCE_SET,
        payload: {
            preferences,
        },
    };
}

export function upsert(preference: DevicePreference) {
    return {
        type: PREFERENCE_SET,
        payload: {
            preference,
        },
    };
}

export function deepdiveInstanceUpsert(
    serial: string,
    deepdive: DeepDiveInstance
) {
    return {
        type: PREFERENCE_DD_UPSERT,
        payload: {
            serial,
            deepdive,
        },
    };
}

export function deepdiveInstanceRemove(serial: string, deepdiveId: string) {
    return {
        type: PREFERENCE_DD_REMOVE,
        payload: {
            serial,
            deepdiveId,
        },
    };
}

export function optionalPollerUpsert(serial: string, optionalPollerId: string) {
    return {
        type: PREFERENCE_OP_UPSERT,
        payload: {
            serial,
            optionalPollerId,
        },
    };
}

export function optionalPollerRemove(serial: string, optionalPollerId: string) {
    return {
        type: PREFERENCE_OP_REMOVE,
        payload: {
            serial,
            optionalPollerId,
        },
    };
}

export function remove(serial: string) {
    return {
        type: PREFERENCE_REMOVE,
        payload: {
            serial,
        },
    };
}
