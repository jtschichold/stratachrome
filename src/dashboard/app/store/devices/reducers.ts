import { Device } from "../../../../common/models";

import { DEVICE_SET, DEVICE_REMOVE } from "./actions";

export interface State {
    deviceList: Device[];
    pollingDevices: string[];
}

const initialState: State = {
    deviceList: [],
    pollingDevices: [],
};

export function devices(state = initialState, action: any): State {
    switch (action.type) {
        case DEVICE_SET:
            return {
                ...state,
                deviceList: deviceSetReducer(
                    state.deviceList,
                    action.payload.devices
                ),
                pollingDevices: action.payload.devices
                    .filter((d: Device) => d.isPolling)
                    .map((d) => d.serial),
            };

        case DEVICE_REMOVE:
            return {
                ...state,
                deviceList: state.deviceList.filter(
                    (d) => action.payload.serials.indexOf(d.serial) === -1
                ),
            };

        default:
            return state;
    }
}

const deviceSetReducer = (
    prevState: Device[],
    nextState: Device[]
): Device[] => {
    return nextState.map((nd) => {
        let od = prevState.find((d) => d.serial === nd.serial);
        if (!od) return nd;

        if (od.apiKey !== nd.apiKey) return nd;
        if (od.deviceName !== nd.deviceName) return nd;
        if (od.model !== nd.model) return nd;
        if (od.swVersion !== nd.swVersion) return nd;
        if (od.url !== nd.url) return nd;
        if (od.viaPanorama !== nd.viaPanorama) return nd;
        if (Object.keys(od.error).length !== Object.keys(nd.error).length)
            return nd;

        if (od.vsysList.length !== nd.vsysList.length) return nd;
        if (nd.vsysList.find((nvsys) => od.vsysList.indexOf(nvsys) === -1))
            return nd;

        if (nd.logicalInterfaces.length !== od.logicalInterfaces.length)
            return nd;
        let checkLi = nd.logicalInterfaces
            .map((nli) => {
                let oli = od.logicalInterfaces.find(
                    (oli) => oli.name === nli.name
                );
                if (!oli) return true;

                if (oli.vsys !== nli.vsys) return true;
                if (oli.zone !== nli.zone) return true;

                return false;
            })
            .filter(Boolean);
        if (checkLi.length !== 0) return nd;

        if (nd.hwInterfaces.length !== od.hwInterfaces.length) return nd;
        let checkHi = nd.hwInterfaces
            .map((nhi) => {
                let ohi = od.hwInterfaces.find((ohi) => ohi.name === nhi.name);
                if (!ohi) return true;

                if (ohi.speed !== nhi.speed) return true;
                if (ohi.state !== nhi.state) return true;
                if (ohi.status !== nhi.status) return true;

                return false;
            })
            .filter(Boolean);
        if (checkHi.length !== 0) return nd;

        return od;
    });
};
