import { store, actions } from "./store";
import { LocalStorageConfig } from "../../common/lib/localstorageconfig";
import {
    Command,
    Device,
    DeviceLogicalInterface,
    DeviceHwInterface,
    DevicePreference,
    OptionalPoller,
} from "../../common/models";
import {
    apiRequestManger,
    OP_SHOW_SYSTEM_INFO,
    CONFIG_VSYS_LIST,
    OP_SHOW_INTERFACE_ALL,
} from "./apirequestmanager";
import { PollerManager } from "./poller";
import "./lib/sync";
import "./lib/gc";
import { StatsDB } from "../../common/lib/statsdb";
import { MetadataDB } from "../../common/lib/metadatadb";
import { initDeepDivesDB } from "./lib/deepdivetemplates";
import { initOptionalPollersDB } from "./lib/optionalpollers";

/**
 * Main class of background script.
 * The "main" of the background script instantiates this class and then calls
 * setup()
 */
class Background {
    private pollerManager: PollerManager;

    /**
     * Initalizes the background activities
     */
    public setup(): void {
        // read config
        this.readConfig();

        // read preferences
        this.readMetadata();

        // handles chrome runtime events
        chrome.runtime.onStartup.addListener(() => {
            this.startup();
        });
        chrome.runtime.onInstalled.addListener((details) => {
            this.install(details);
        });

        // add a listener to recv messages from content script
        // and dashboard
        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                return this.onMessage(message, sender, sendResponse);
            }
        );

        // setup browseraction stuff
        chrome.browserAction.setBadgeText({ text: "0" });
        chrome.browserAction.setBadgeBackgroundColor({ color: "#2e4256" });
        chrome.browserAction.onClicked.addListener(() => {
            chrome.tabs.create({
                url: chrome.extension.getURL("dashboard.html"),
                active: true,
            });
        });

        // subscribe to the store to update the bade text
        store.subscribe(() => {
            this.updateBadgeText();
        });

        // initalizes the poller manager
        this.pollerManager = new PollerManager();
    }

    /**
     * Called when the extension is installed for the first time
     * or when it is upgraded
     * @param details - Install details
     */
    private install(details: chrome.runtime.InstalledDetails) {
        console.log("Install");

        // initalize the default config
        LocalStorageConfig.initDefault();

        // initialize the metadata db
        let promise = initDeepDivesDB();
        promise = promise.then(() => {
            return initOptionalPollersDB();
        });
        promise.then(
            (result) => {
                console.log("Successfully initalized DDDB");
            },
            (err) => {
                console.log("Error initalizing DDDB: " + err);
            }
        );
    }

    /**
     * Called when extension is started in a Chrome session
     */
    private startup() {
        StatsDB.deleteAll();
    }

    /**
     * Reads the config from the LocalStorage and stores
     * it in the store
     */
    private readConfig() {
        let config = new LocalStorageConfig();

        store.dispatch(
            actions.config.set(
                "notificationTimeout",
                config.notificationTimeout
            )
        );
        store.dispatch(
            actions.config.set("trackingInterval", config.trackingInterval)
        );
        store.dispatch(
            actions.config.set("pollingDefault", config.pollingDefault)
        );
        store.dispatch(
            actions.config.set(
                "jobsTrackingInterval",
                config.jobsTrackingInterval
            )
        );
        store.dispatch(
            actions.config.set(
                "ifsTrackingInterval",
                config.ifsTrackingInterval
            )
        );
        store.dispatch(
            actions.config.set("requestTimeout", config.requestTimeout)
        );
        store.dispatch(
            actions.config.set("maxRunningReq", config.maxRunningReq)
        );
        store.dispatch(actions.config.set("filteredJobs", config.filteredJobs));
        store.dispatch(actions.config.set("maxHistory", config.maxHistory));
        store.dispatch(
            actions.config.set(
                "highMemoryThreshold",
                config.highMemoryThreshold
            )
        );
        store.dispatch(
            actions.config.set("highCpuThreshold", config.highCpuThreshold)
        );
    }

    /**
     * Reads preferences from DB and store them
     */
    private readMetadata() {
        let metadataDB = new MetadataDB();
        metadataDB.open().then(() => {
            return metadataDB
                .loadAll<DevicePreference>("preferences")
                .then((preferences) => {
                    store.dispatch(
                        actions.metadata.setPreferences(preferences)
                    );
                    return metadataDB.loadAll<OptionalPoller>(
                        "optionalpollers"
                    );
                })
                .then((optionalPollers) => {
                    store.dispatch(
                        actions.metadata.setOptionalPollers(optionalPollers)
                    );
                });
        });
    }

    /**
     * Extension message handler, called by Chrome when background
     * script receives a message from content script or dashboard
     * @param request - message received
     * @param sender - sender of the messsage
     * @param sendResponse - called by the handler to send a response
     */
    private onMessage(
        request: Command,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) {
        // get list of monitored devices
        if (request.cmd == "getmonitored") {
            var result = [];
            for (let device of store.getState().devices.deviceList) {
                result.push(device);
            }
            sendResponse({ result });
        }

        // check if device is already monitored
        if (request.cmd == "isalreadymonitored") {
            let senderUrl = this.extractUrl(sender);
            let result =
                store
                    .getState()
                    .devices.deviceList.filter((d) => d.url === senderUrl)
                    .length !== 0;
            sendResponse({ result });
        }

        // reread configuration
        if (request.cmd == "readconfig") {
            this.readConfig();
        }

        // reread preferences
        if (request.cmd == "readmetadata") {
            this.readMetadata();
        }

        // add device, called by content script
        if (request.cmd == "add") {
            let senderUrl = this.extractUrl(sender);
            let isMonitored =
                store
                    .getState()
                    .devices.deviceList.filter((d) => d.url === senderUrl)
                    .length !== 0;
            if (isMonitored) {
                return;
            }

            this.addDevice(senderUrl, request.user, request.password).then(
                (device) => {
                    new Notification(`Device ${device.serial} Added`, {
                        icon: "images/icon_128.png",
                    });
                },
                (reason) => {
                    console.log("Error", reason);
                    new Notification(`Error adding device: ${reason}`, {
                        icon: "images/icon_128.png",
                    });
                }
            );
        }

        // add device called by dashboard
        if (request.cmd == "adddevice") {
            this.addDevice(
                request.url,
                request.user,
                request.password,
                request.apiKey
            ).then(
                (device) => {
                    sendResponse({ result: `Device ${device.serial} Added` });
                },
                (reason) => {
                    console.log("Error", reason);
                    sendResponse({ error: "" + reason });
                }
            );

            return true;
        }

        // delete device
        if (request.cmd === "delete") {
            store.dispatch(actions.devices.bulkRemove(request.serials));
        }

        if (request.cmd === "poll") {
            this.pollerManager.poll(request.serial);
        }
    }

    /**
     * Extracts URL of the message Message Sender
     * @param sender - sender of the message
     * @return url or null if url is invalid
     */
    private extractUrl(sender: chrome.runtime.MessageSender): string | null {
        try {
            let url = new URL(sender.tab.url);
            return url.protocol + "//" + url.host;
        } catch (err) {
            return null;
        }
    }

    /**
     * Adds device to the list of monitored device in the store
     * Username & Password or API Key should be provided
     * @param url - API URL
     * @param user - Username
     * @param password - Password
     * @param key - API Key
     */
    private addDevice(
        url: string,
        user?: string,
        password?: string,
        key?: string
    ): Promise<Device> {
        let apiKey = Promise.resolve(key);

        // grab the API Key if needed
        if (!key) {
            apiKey = apiRequestManger.keyGen(url, user, password);
        }

        // retrieve system info. Serial is "not-yet" because we do not know it yet
        let result: Promise<Device> = apiKey.then((key) => {
            return apiRequestManger
                .sendOpCmd(url, key, "not-yet", OP_SHOW_SYSTEM_INFO)
                .then((reselement) => {
                    let serial = reselement.querySelector("serial").textContent;
                    let model = reselement.querySelector("model").textContent;
                    let swVersion = reselement.querySelector("sw-version")
                        .textContent;
                    let deviceName = reselement.querySelector("devicename")
                        .textContent;
                    let multiVsys = reselement.querySelector("multi-vsys")
                        .textContent;

                    let newDevice: Device = {
                        url,
                        viaPanorama: false,
                        apiKey: key,
                        serial,
                        model,
                        swVersion,
                        deviceName,
                        hwInterfaces: [],
                        logicalInterfaces: [],
                        vsysList: multiVsys === "off" ? [] : undefined,
                        isPolling: 0,
                        error: {},
                        disabled: false,
                    };

                    return newDevice;
                });
        });

        result = result.then((newDevice) => {
            return apiRequestManger
                .sendOpCmd(
                    newDevice.url,
                    newDevice.apiKey,
                    newDevice.serial,
                    OP_SHOW_INTERFACE_ALL
                )
                .then((showInterfaceAllResult) => {
                    let ifNet = showInterfaceAllResult.querySelector("ifnet");
                    if (ifNet) {
                        for (let entry of ifNet.querySelectorAll("entry")) {
                            let newif: DeviceLogicalInterface = {
                                name: entry.querySelector("name")?.textContent,
                                zone: entry.querySelector("zone")?.textContent,
                                vsys: entry.querySelector("vsys")?.textContent,
                            };
                            if (!newif.name) continue;

                            newDevice.logicalInterfaces.push(newif);
                        }
                    }

                    let hw = showInterfaceAllResult.querySelector("hw");
                    if (hw) {
                        for (let entry of hw.querySelectorAll("entry")) {
                            let newif: DeviceHwInterface = {
                                name: entry.querySelector("name")?.textContent,
                                state: entry.querySelector("state")
                                    ?.textContent,
                                status: entry.querySelector("st")?.textContent,
                                speed: entry.querySelector("speed")
                                    ?.textContent,
                            };
                            if (!newif.name) continue;

                            newDevice.hwInterfaces.push(newif);
                        }
                    }

                    return newDevice;
                });
        });

        // retrieve list of vsys
        result = result.then((newDevice) => {
            if (typeof newDevice.vsysList !== "undefined") {
                return newDevice;
            }

            return apiRequestManger
                .sendConfigGet(
                    newDevice.url,
                    newDevice.apiKey,
                    newDevice.serial,
                    CONFIG_VSYS_LIST
                )
                .then((result) => {
                    let vsyses = result.querySelectorAll("entry");
                    let vsysList: string[] = [];

                    for (let vsys of vsyses) {
                        let vsysName = vsys.getAttribute("name");
                        if (!vsysName) continue;

                        vsysList.push(vsysName);
                    }
                    newDevice.vsysList = vsysList;

                    return newDevice;
                });
        });

        result = result.then((newDevice) => {
            store.dispatch(actions.devices.add(newDevice));

            return newDevice;
        });

        return result;
    }

    /**
     * Updates number of monitored devices in the badge
     */
    private updateBadgeText() {
        chrome.browserAction.setBadgeText({
            text: "" + store.getState().devices.deviceList.length,
        });
    }
}

new Background().setup();
