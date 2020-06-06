import { DevicePreference, OptionalPoller } from "../../../../common/models";

export const PREFERENCE_SET: string = "PREFERENCE_SET";
export const OPTIONALPOLLER_SET: string = "OPTIONALPOLLER_SET";

export function setPreferences(preferences: DevicePreference[]) {
    return {
        type: PREFERENCE_SET,
        payload: {
            preferences,
        },
    };
}

export function setOptionalPollers(optionalPollers: OptionalPoller[]) {
    return {
        type: OPTIONALPOLLER_SET,
        payload: {
            optionalPollers,
        },
    };
}
