import { Device } from "../../../../common/models";
import * as deviceUtils from "../../../../common/lib/deviceutils";

import {
    DEVICE_ADD,
    DEVICE_REMOVE,
    DEVICE_BULK_REMOVE,
    DEVICE_INC_POLLING,
    DEVICE_DEC_POLLING,
    DEVICE_SET_ERROR,
    DEVICE_DISABLE,
    DEVICE_ENABLE,
} from "./actions";

export interface State {
    deviceList: Device[];
}

const initialState: State = {
    deviceList: [],
};

export function devices(state = initialState, action: any): State {
    switch (action.type) {
        case DEVICE_ADD:
            return {
                ...state,
                deviceList: [
                    ...state.deviceList.filter(
                        (entry) =>
                            !deviceUtils.cmp(entry, action.payload.device)
                    ),
                    action.payload.device,
                ],
            };

        case DEVICE_REMOVE:
            return {
                ...state,
                deviceList: [
                    ...state.deviceList.filter(
                        (entry) =>
                            !deviceUtils.cmp(entry, action.payload.device)
                    ),
                ],
            };

        case DEVICE_BULK_REMOVE:
            return {
                ...state,
                deviceList: [
                    ...state.deviceList.filter(
                        (entry) =>
                            action.payload.serials.indexOf(entry.serial) === -1
                    ),
                ],
            };

        case DEVICE_SET_ERROR:
            return deviceSetError(state, action);

        case DEVICE_INC_POLLING:
            return deviceIncPolling(state, action);

        case DEVICE_DEC_POLLING:
            return deviceDecPolling(state, action);

        case DEVICE_DISABLE:
            return deviceDisable(state, action);

        case DEVICE_ENABLE:
            return deviceEnable(state, action);

        default:
            return state;
    }
}

function deviceSetError(state: State, action: any): State {
    let { serial, emsg, etype } = action.payload;
    let device = state.deviceList.find((entry) => entry.serial === serial);
    if (!device) return state;

    if (!emsg) {
        if (!device.error || !device.error[etype]) return state;
        delete device.error[etype];
    } else {
        device.error[etype] = emsg;
    }

    return {
        ...state,
        deviceList: [
            ...state.deviceList.filter((entry) => entry.serial !== serial),
            device,
        ],
    };
}

function deviceIncPolling(state: State, action: any): State {
    let { serial } = action.payload;
    let device = state.deviceList.find(
        (entry) => entry.serial === action.payload.serial
    );
    if (!device) return state;

    device.isPolling = device.isPolling + 1;

    return {
        ...state,
        deviceList: [
            ...state.deviceList.filter((entry) => entry.serial !== serial),
            device,
        ],
    };
}

function deviceDecPolling(state: State, action: any): State {
    let { serial } = action.payload;
    let device = state.deviceList.find(
        (entry) => entry.serial === action.payload.serial
    );
    if (!device) return state;

    device.isPolling = device.isPolling - 1;

    return {
        ...state,
        deviceList: [
            ...state.deviceList.filter((entry) => entry.serial !== serial),
            device,
        ],
    };
}

function deviceEnable(state: State, action: any): State {
    let { serial } = action.payload;
    let device = state.deviceList.find(
        (entry) => entry.serial === action.payload.serial
    );
    if (!device) return state;

    let newDevice: Device = {
        ...device,
        disabled: false,
    };

    return {
        ...state,
        deviceList: [
            ...state.deviceList.filter((entry) => entry.serial !== serial),
            newDevice,
        ],
    };
}

function deviceDisable(state: State, action: any): State {
    let { serial } = action.payload;
    let device = state.deviceList.find(
        (entry) => entry.serial === action.payload.serial
    );
    if (!device) return state;

    let newDevice: Device = {
        ...device,
        disabled: true,
    };

    return {
        ...state,
        deviceList: [
            ...state.deviceList.filter((entry) => entry.serial !== serial),
            newDevice,
        ],
    };
}
