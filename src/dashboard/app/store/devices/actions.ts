import { Device } from "../../../../common/models/device";

export const DEVICE_SET: string = "DEVICE_SET";
export const DEVICE_REMOVE: string = "DEVICE_REMOVE";

export function set(devices: Device[]) {
    return {
        type: DEVICE_SET,
        payload: {
            devices,
        },
    };
}

export function remove(serials: string[]) {
    return {
        type: DEVICE_REMOVE,
        payload: {
            serials,
        },
    };
}
