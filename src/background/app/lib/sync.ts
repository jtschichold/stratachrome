import { store, actions } from "../store";
import { Command, Device } from "../../../common/models";

class Synchronizer {
    private currentDeviceList: any;

    constructor() {
        this.currentDeviceList = store.getState().devices.deviceList;

        store.subscribe(() => this.storeChanged());
    }

    private storeChanged() {
        let { deviceList } = store.getState().devices;
        if (deviceList !== this.currentDeviceList) {
            chrome.runtime.sendMessage({
                cmd: "devicelistchanged",
            });
        }
    }
}

export const synchronizer = new Synchronizer();
