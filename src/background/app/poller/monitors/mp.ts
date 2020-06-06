import { OpCmdMonitor } from "./model";
import { MPPoint } from "../../../../common/models";
import { notifyDeviceUpdate } from "../../lib/devicenotifications";
import { store, actions } from "../../store";

const OP_SHOW_SYSTEM_RESOURCES =
    "<show><system><resources></resources></system></show>";

const MP_CPU_RE = /Cpu\(s\)\:\W+([0-9]+\.[0-9]+)\%us,\W+([0-9]+\.[0-9]+)\%sy,\W+([0-9]+\.[0-9]+)\%ni,\W+([0-9]+\.[0-9]+)\%id,\W+([0-9]+.[0-9]+)\%wa,\W+([0-9]+\.[0-9]+)\%hi,\W+([0-9]+\.[0-9]+)\%si,\W+([0-9]+\.[0-9]+)\%st/;
const MP_CPU_RE_9 = /%Cpu\(s\)\:\W+([0-9]+\.[0-9]+)\Wus,\W+([0-9]+\.[0-9]+)\Wsy,\W+([0-9]+\.[0-9]+)\Wni,\W+([0-9]+\.[0-9]+)\Wid,\W+([0-9]+.[0-9]+)\Wwa,\W+([0-9]+\.[0-9]+)\Whi,\W+([0-9]+\.[0-9]+)\Wsi,\W+([0-9]+\.[0-9]+)\Wst/;
const MP_MEM_RE = /Mem:\W+[0-9]+k\W+total,\W+([0-9]+)k\W+used,\W+([0-9]+)k\W+free\W+([0-9]+)k\W+buffers[\s\S]*\W+([0-9]+)k\W+cached/;
const MP_MEM_RE_9 = /KiB\W+Mem\W+:\W+[0-9]+\W+total,\W+([0-9]+)\W+free,\W+([0-9]+)\W+used\W+([0-9]+)\W+buff\/cache/;
const MP_SWAP_RE = /Swap:\W+[0-9]+k\W+total,\W+([0-9]+)k\W+used,\W+([0-9]+)k\W+free/;
const MP_SWAP_RE_9 = /KiB\W+Swap:\W+[0-9]+\W+total,\W+([0-9]+)\W+free,\W+([0-9]+)\W+used/;
const MP_CPU_LOAD_AVG = /load average: (\d+\.\d+),\W*(\d+\.\d+),\W*(\d+\.\d+)/;

export class MPMonitor extends OpCmdMonitor {
    opCmd = OP_SHOW_SYSTEM_RESOURCES;

    private highCpuThreshold: number = 75;
    private highMemoryThreshold: number = 75;

    handleResult(result: Element) {
        let self: MPMonitor = this;
        let o2store: Partial<MPPoint> = {};
        let trem: RegExpMatchArray;
        let majorVersion: number;

        if (!result.textContent) return;
        let topCData = result.textContent;

        if (this.device.swVersion) {
            let [t, ..._] = this.device.swVersion.split(".");
            majorVersion = parseInt(t);
        }

        // CPU
        if (majorVersion >= 9) {
            // PAN-OS 9.0 or more
            trem = topCData.match(MP_CPU_RE_9);
        } else {
            trem = topCData.match(MP_CPU_RE);
        }
        if (trem !== null) {
            o2store.us = parseFloat(trem[1]);
            o2store.sy = parseFloat(trem[2]);
            o2store.ni = parseFloat(trem[3]);
            o2store.id = parseFloat(trem[4]);
            o2store.wa = parseFloat(trem[5]);
            o2store.hi = parseFloat(trem[6]);
            o2store.si = parseFloat(trem[7]);
            o2store.st = parseFloat(trem[8]);
        }

        // Memory
        if (majorVersion >= 9) {
            // PAN-OS 9.0 or more
            trem = topCData.match(MP_MEM_RE_9);
            if (trem !== null) {
                let [_, free, used, buffcache] = trem;
                o2store.memoryUsed = parseInt(used);
                o2store.memoryFree = parseInt(free) + parseInt(buffcache);
            }
        } else {
            trem = topCData.match(MP_MEM_RE);
            if (trem !== null) {
                let [_, used, free, buffer, cached] = trem;
                let bc = parseInt(buffer) + parseInt(cached);
                o2store.memoryUsed = parseInt(used) - bc;
                o2store.memoryFree = parseInt(free) + bc;
            }
        }

        // swap
        if (majorVersion >= 9) {
            // PAN-OS 9.0 or more
            trem = topCData.match(MP_SWAP_RE_9);
            if (trem !== null) {
                let [_, free, used] = trem;
                o2store.swapUsed = parseInt(used);
                o2store.swapFree = parseInt(free);
            }
        } else {
            trem = topCData.match(MP_SWAP_RE);
            if (trem !== null) {
                let [_, used, free] = trem;
                o2store.swapUsed = parseInt(used);
                o2store.swapFree = parseInt(free);
            }
        }

        // load average
        trem = topCData.match(MP_CPU_LOAD_AVG);
        if (trem !== null) {
            let [_, m1, m5, m15] = trem;
            o2store.loadAvg1Minute = parseFloat(m1);
            o2store.loadAvg5Minutes = parseFloat(m5);
            o2store.loadAvg15Minutes = parseFloat(m15);
        }

        return this.statsdb
            .add("mp", o2store)
            .then(function (msg) {
                notifyDeviceUpdate(self.device.serial, "mp");
            })
            .then(null, function (err) {
                console.log(
                    "Error saving mp for device " +
                        self.device.serial +
                        ": " +
                        err
                );

                throw err;
            })
            .then(() => {
                if (
                    self.highCpuThreshold &&
                    self.highCpuThreshold !== 0 &&
                    o2store.id < 100.0 - self.highCpuThreshold
                ) {
                    store.dispatch(actions.devices.disable(self.device.serial));
                    throw "High CPU - Monitoring disabled";
                }

                if (
                    self.highMemoryThreshold &&
                    self.highMemoryThreshold !== 0 &&
                    o2store.memoryUsed / o2store.memoryFree >
                        self.highMemoryThreshold
                ) {
                    store.dispatch(actions.devices.disable(self.device.serial));
                    throw "High Memory - Monitoring disabled";
                }
            });
    }

    applyConfig() {
        super.applyConfig();

        let newKnob = store
            .getState()
            .config.store.find((e) => e.key === "highCpuThreshold");
        if (newKnob) {
            this.highCpuThreshold = newKnob.value;
        }

        newKnob = store
            .getState()
            .config.store.find((e) => e.key === "highMemoryThreshold");
        if (newKnob) {
            this.highMemoryThreshold = newKnob.value;
        }
    }
}
