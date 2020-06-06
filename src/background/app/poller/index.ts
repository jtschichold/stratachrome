import {
    Device,
    DevicePreference,
    OptionalPoller,
    SessionAllOptionalMetric,
} from "../../../common/models";
import {
    DPMonitor,
    GPGWMonitor,
    IfsMonitor,
    MPMonitor,
    SessionInfoMonitor,
    CounterGlobalMonitor,
    SessionAllMonitor,
} from "./monitors";
import { StatsDB } from "../../../common/lib/statsdb";
import { apiRequestManger } from "../apirequestmanager";
import { store } from "../store";

class Poller {
    isDisabled: boolean = false;

    private statsDB: StatsDB;
    private dpMonitor: DPMonitor;
    private gpgwMonitor: GPGWMonitor;
    private ifsMonitor: IfsMonitor;
    private sessionInfoMonitor: SessionInfoMonitor;
    private mpMonitor: MPMonitor;
    private counterGlobalMonitor: CounterGlobalMonitor;
    private sessionAllMonitor: SessionAllMonitor;

    constructor(
        public device: Device,
        public optionalPollers?: OptionalPoller[]
    ) {
        this.statsDB = new StatsDB(device.serial);
    }

    start() {
        this.statsDB.openDB().then(() => {
            this.dpMonitor = new DPMonitor(this.device, this.statsDB);
            this.dpMonitor.start();

            this.ifsMonitor = new IfsMonitor(this.device, this.statsDB);
            this.ifsMonitor.start();

            this.sessionInfoMonitor = new SessionInfoMonitor(
                this.device,
                this.statsDB
            );
            this.sessionInfoMonitor.start();

            this.mpMonitor = new MPMonitor(this.device, this.statsDB);
            this.mpMonitor.start();

            this.counterGlobalMonitor = new CounterGlobalMonitor(
                this.device,
                this.statsDB
            );
            this.counterGlobalMonitor.start();

            this.applyOptionalPollers();
        });
    }

    stop() {
        this.dpMonitor.cancel();
        this.ifsMonitor.cancel();
        this.sessionInfoMonitor.cancel();
        this.mpMonitor.cancel();
        this.counterGlobalMonitor.cancel();

        if (this.gpgwMonitor) {
            this.gpgwMonitor.cancel();
        }

        apiRequestManger.cancelQueuedByDevice(this.device);
    }

    updateOptionalPollers(optionalPollers: OptionalPoller[]) {
        this.optionalPollers = optionalPollers;
        this.applyOptionalPollers();
    }

    poll() {
        setTimeout(() => {
            this.dpMonitor.poll(true);
            this.ifsMonitor.poll(true);
            this.sessionInfoMonitor.poll(true);
            this.mpMonitor.poll(true);
            this.counterGlobalMonitor.poll(true);
            this.gpgwMonitor && this.gpgwMonitor.poll(true);
            this.sessionAllMonitor && this.sessionAllMonitor.poll(true);
        }, 0);
    }

    enable() {
        this.isDisabled = true;
        this.dpMonitor.enable();
        this.ifsMonitor.enable();
        this.sessionInfoMonitor.enable();
        this.mpMonitor.enable();
        this.counterGlobalMonitor.enable();
        this.gpgwMonitor && this.gpgwMonitor.enable();
        this.sessionAllMonitor && this.sessionAllMonitor.enable();
    }

    disable() {
        this.isDisabled = false;
        this.dpMonitor.disable();
        this.ifsMonitor.disable();
        this.sessionInfoMonitor.disable();
        this.mpMonitor.disable();
        this.counterGlobalMonitor.disable();
        this.gpgwMonitor && this.gpgwMonitor.disable();
        this.sessionAllMonitor && this.sessionAllMonitor.disable();
    }

    private applyOptionalPollers() {
        // XXX gpgw id should be somewhat global
        if (
            this.optionalPollers.find(
                (op) => op.id === "ef875b26-4ffa-44ab-8448-4d2bec43fc56"
            )
        ) {
            if (!this.gpgwMonitor) {
                this.gpgwMonitor = new GPGWMonitor(this.device, this.statsDB);
                this.gpgwMonitor.start();
            }
        } else {
            if (this.gpgwMonitor) {
                this.gpgwMonitor.cancel();
                this.gpgwMonitor = null;
            }
        }

        let sessionAllMetrics: SessionAllOptionalMetric[] = this.optionalPollers.filter(
            (op) => op.type === "sessionall"
        ) as SessionAllOptionalMetric[];
        if (sessionAllMetrics.length === 0) {
            if (this.sessionAllMonitor) {
                this.sessionAllMonitor.cancel();
                this.sessionAllMonitor = null;
            }
        } else {
            let sessionAllMonitor =
                this.sessionAllMonitor ||
                new SessionAllMonitor(this.device, this.statsDB);
            sessionAllMonitor.updateMetrics(sessionAllMetrics);
            if (!this.sessionAllMonitor) {
                this.sessionAllMonitor = sessionAllMonitor;
                this.sessionAllMonitor.start();
            }
        }
    }
}

export class PollerManager {
    private pollers: Poller[] = [];
    private memoizedDeviceList: Device[] = null;
    private memoizedPreferences: DevicePreference[] = null;

    constructor() {
        this.updatePollers();
        store.subscribe(() => this.updatePollers());
    }

    poll(serial: string) {
        let p = this.pollers.find((p) => p.device.serial === serial);
        p && p.poll();
    }

    private updatePollers() {
        let state = store.getState();
        let devices = state.devices.deviceList;
        let { preferences, optionalPollers } = state.metadata;

        if (
            this.memoizedDeviceList === devices &&
            this.memoizedPreferences === preferences
        )
            return;

        this.memoizedDeviceList = devices;

        // difference between devices and current pollers
        let deviceSerials = devices.map((d) => d.serial);
        let pollerSerials = this.pollers.map((p) => p.device.serial);
        let newSerials = deviceSerials.filter(
            (s) => pollerSerials.indexOf(s) === -1
        );
        let oldSerials = pollerSerials.filter(
            (s) => deviceSerials.indexOf(s) === -1
        );

        // delete removed devices
        for (let oldserial of oldSerials) {
            let oldpoller = this.pollers.find(
                (p) => p.device.serial === oldserial
            );
            if (!oldpoller) continue;

            oldpoller.stop();
            this.pollers = this.pollers.filter(
                (p) => p.device.serial !== oldserial
            );
        }

        // if preferences have been updated, update existing devices
        if (this.memoizedPreferences !== preferences) {
            this.pollers.forEach((poller) => {
                poller.updateOptionalPollers(
                    this.getOptionalPollersForDevice(
                        poller.device.serial,
                        preferences,
                        optionalPollers
                    )
                );
            });
        }
        this.memoizedPreferences = preferences;

        // add new devices
        for (let newserial of newSerials) {
            let newDevice = devices.find((d) => d.serial === newserial);
            if (!newDevice) continue;

            let poller = new Poller(
                newDevice,
                this.getOptionalPollersForDevice(
                    newDevice.serial,
                    preferences,
                    optionalPollers
                )
            );
            this.pollers.push(poller);
            poller.start();
        }

        devices.forEach((d) => {
            let dp = this.pollers.find((p) => p.device.serial === d.serial);
            if (!dp) return; // XXX error

            if (d.disabled && !dp.isDisabled) {
                dp.disable();
                return;
            }
            if (!d.disabled && dp.isDisabled) {
                dp.enable();
                return;
            }
        });
    }

    private getOptionalPollersForDevice(
        serial: string,
        preferences: DevicePreference[],
        optionalPollers: OptionalPoller[]
    ): OptionalPoller[] {
        let preference = preferences.find((p) => p.serial === serial);
        if (!preference || !preference.enabledOptionalPollers) return [];

        let result = preference.enabledOptionalPollers.map((opid) =>
            optionalPollers.find((op) => op.id === opid)
        );
        return result.filter(Boolean);
    }
}
