import { store, actions } from "../store";
import {
    Command,
    Device,
    DeepDiveTemplate,
    DevicePreference,
    OptionalPoller,
} from "../../../common/models";
import { MetadataDB } from "../../../common/lib/metadatadb";

class Synchronizer {
    private memoizedPreferences: DevicePreference[] = [];

    constructor() {
        this.updateDeviceList();
        this.updateMetadata();

        chrome.runtime.onMessage.addListener((message, sender, response) =>
            this.onMessage(message, sender, response)
        );

        store.subscribe(this.storeListener);
    }

    private updateDeviceList() {
        // init device list in store
        chrome.runtime.sendMessage(
            {
                cmd: "getmonitored",
            },
            (response: { result: Device[] }) => {
                store.dispatch(actions.devices.set(response.result));
            }
        );
    }

    private updateMetadata() {
        let metadataDb = new MetadataDB();
        metadataDb
            .open()
            .then(() => {
                return metadataDb
                    .loadAll<DeepDiveTemplate>("deepdives")
                    .then((templates) => {
                        store.dispatch(
                            actions.metadata.setTemplates(templates)
                        );
                    });
            })
            .then(() => {
                return metadataDb
                    .loadAll<DevicePreference>("preferences")
                    .then((preferences) => {
                        store.dispatch(actions.preferences.set(preferences));
                    });
            })
            .then(() => {
                return metadataDb
                    .loadAll<OptionalPoller>("optionalpollers")
                    .then((optionalPollers) => {
                        store.dispatch(
                            actions.metadata.setOptionalPollers(optionalPollers)
                        );
                    });
            })
            .catch((err) => {
                console.log("Error loading metadataDb: " + err);
            });
    }

    private onMessage(
        message: Command,
        sender: chrome.runtime.MessageSender,
        response: (response?: any) => void
    ) {
        if (message.cmd === "devicelistchanged") {
            setTimeout(() => this.updateDeviceList());
        }
    }

    private storeListener = () => {
        let state = store.getState();

        state.preferences.preferences.forEach((p) => {
            if (this.memoizedPreferences.indexOf(p) === -1) {
                let metadataDb = new MetadataDB();
                metadataDb.open().then(() => {
                    metadataDb.put("preferences", p);
                });
            }
        });

        this.memoizedPreferences = state.preferences.preferences;
    };
}

export const synchronizer = new Synchronizer();
