import { Device } from "../../../../common/models/device";

export const DEVICE_ADD: string = "DEVICE_ADD";
export const DEVICE_REMOVE: string = "DEVICE_REMOVE";
export const DEVICE_BULK_REMOVE: string = "DEVICE_BULK_REMOVE";
export const DEVICE_SET_ERROR: string = "DEVICE_SET_ERROR";
export const DEVICE_INC_POLLING: string = "DEVICE_INC_POLLING";
export const DEVICE_DEC_POLLING: string = "DEVICE_DEC_POLLING";
export const DEVICE_DISABLE: string = "DEVICE_DISABLE";
export const DEVICE_ENABLE: string = "DEVICE_ENABLE";

export function add(device: Device) {
    return {
        type: DEVICE_ADD,
        payload: {
            device,
        },
    };
}

export function remove(apiKey: string, url: string, serial?: string) {
    return {
        type: DEVICE_REMOVE,
        payload: {
            apiKey,
            url,
            serial,
        },
    };
}

export function bulkRemove(serials: string[]) {
    return {
        type: DEVICE_BULK_REMOVE,
        payload: {
            serials,
        },
    };
}

export function setError(serial: string, etype: string, emsg: string | null) {
    return {
        type: DEVICE_SET_ERROR,
        payload: {
            serial,
            etype,
            emsg,
        },
    };
}

export function incPolling(serial: string) {
    return {
        type: DEVICE_INC_POLLING,
        payload: {
            serial,
        },
    };
}

export function decPolling(serial: string) {
    return {
        type: DEVICE_DEC_POLLING,
        payload: {
            serial,
        },
    };
}

export function disable(serial: string) {
    return {
        type: DEVICE_DISABLE,
        payload: {
            serial,
        },
    };
}

export function enable(serial: string) {
    return {
        type: DEVICE_ENABLE,
        payload: {
            serial,
        },
    };
}
