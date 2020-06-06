import { Command } from "../../../common/models";

class DeviceNotificationsReceiver {
    private nextId: number = 0;
    private listeners: {
        [serial: string]: { _id: number; callback: (utype: string) => void }[];
    } = {};

    constructor() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
            this.onMessage(message, sender, sendResponse)
        );
    }

    addListener(serial: string, callback: (utype: string) => void): number {
        if (!this.listeners[serial]) this.listeners[serial] = [];

        let listenerId = this.nextId;
        this.nextId += 1;

        this.listeners[serial].push({
            _id: listenerId,
            callback,
        });

        return listenerId;
    }

    removeListener(serial: string, listener: number) {
        if (!this.listeners[serial]) return;

        this.listeners[serial] = this.listeners[serial].filter(
            (l) => l._id !== listener
        );
    }

    private onMessage(
        message: Command,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) {
        if (message.cmd !== "deviceupdate") return;

        let { serial, utype } = message;

        if (this.listeners[serial]) {
            for (let listener of this.listeners[serial]) {
                listener.callback(utype);
            }
        }
    }
}

export const deviceNotificationsReceiver = new DeviceNotificationsReceiver();
