import { State } from "../store";
import { createAlmostShallowSelector } from "../../../common/lib/storeutils";

const getDevicesWithPrefsSerials = (state: State) =>
    state.preferences.preferences.map((p) => p.serial);
const getDeviceList = (state: State) => state.devices.deviceList;

export const getKnownSerials = createAlmostShallowSelector(
    [getDeviceList, getDevicesWithPrefsSerials],
    (currentDevices, prefsSerials) => {
        return [
            ...currentDevices.map((d) => ({
                name: d.deviceName,
                serial: d.serial,
            })),
            ...prefsSerials
                .filter(
                    (s) =>
                        currentDevices.findIndex((cd) => cd.serial === s) === -1
                )
                .map((ps) => ({
                    name: null,
                    serial: ps,
                })),
        ];
    }
);
