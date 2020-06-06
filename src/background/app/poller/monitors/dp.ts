import camelCase from "lodash/camelCase";

import { OpCmdMonitor } from "./model";
import {
    DPStats,
    DPStatsEntry,
    DPStatsPeriod,
    DPPoint,
} from "../../../../common/models";
import { notifyDeviceUpdate } from "../../lib/devicenotifications";

const OP_SHOW_RESOURCE_MONITOR =
    "<show><running><resource-monitor></resource-monitor></running></show>";

export class DPMonitor extends OpCmdMonitor {
    opCmd = OP_SHOW_RESOURCE_MONITOR;

    handleResult(result: Element) {
        let o2store: DPPoint = {};
        let dps = result.querySelector("data-processors");
        let self: DPMonitor = this;

        if (!dps) {
            // we are in 2012, PAN-OS 5.0 with a bug
            o2store = this.handleOldAPI(result);
        } else {
            o2store = this.handleRecentAPI(result);
        }

        return this.statsdb
            .add("dp", o2store)
            .then(function (msg) {
                notifyDeviceUpdate(self.device.serial, "dp");
            })
            .then(null, function (err) {
                console.log(
                    "Error saving dp for device " +
                        this.device.serial +
                        ": " +
                        err
                );

                throw err;
            });
    }

    handleOldAPI(result: Element): DPPoint {
        // XXX old API not supported
        // bubble up error somehow
        let o2store = {};

        return o2store;
    }

    handleRecentAPI(resourceMonitor: Element): DPPoint {
        let result: DPPoint = {};
        let dps = resourceMonitor.querySelector("data-processors");

        if (!dps) {
            return result;
        }

        for (let dp = dps.firstChild; dp !== null; dp = dp.nextSibling) {
            let currentDP: DPStats = {};
            if (dp.nodeType !== dp.ELEMENT_NODE) continue;
            let edp = dp as Element;

            for (
                let period = dp.firstChild;
                period !== null;
                period = period.nextSibling
            ) {
                let currentPeriod: DPStatsPeriod = {};
                if (period.nodeType !== period.ELEMENT_NODE) continue;
                let eperiod = period as Element;

                for (
                    let kpi = period.firstChild;
                    kpi !== null;
                    kpi = kpi.nextSibling
                ) {
                    if (kpi.nodeType !== kpi.ELEMENT_NODE) continue;
                    let kpiTag = (kpi as Element).tagName;

                    switch (kpiTag) {
                        case "cpu-load-average":
                            currentPeriod.cpuLoadAverage = this.decodeDPStats(
                                kpi,
                                "coreid"
                            );
                            break;

                        case "cpu-load-maximum":
                            currentPeriod.cpuLoadMaximum = this.decodeDPStats(
                                kpi,
                                "coreid"
                            );
                            break;

                        case "resource-utilization":
                            currentPeriod.resourceUtilization = this.decodeDPStats(
                                kpi,
                                "name"
                            );
                            break;

                        case "task":
                            currentPeriod.task = this.decodeTask(kpi);
                            break;

                        default:
                            console.log("Unknown dp tag", kpiTag);
                    }
                }

                currentDP[eperiod.tagName] = currentPeriod;
            }

            result[edp.tagName] = currentDP;
        }

        return result;
    }

    private decodeDPStats(kpi: ChildNode, entryNameTag: string): DPStatsEntry {
        let result: DPStatsEntry = {};

        for (
            let entry = kpi.firstChild;
            entry !== null;
            entry = entry.nextSibling
        ) {
            if (entry.nodeType !== entry.ELEMENT_NODE) continue;

            let key = (entry as Element).querySelector(entryNameTag);
            if (!key || !key.textContent) continue;

            let value = (entry as Element).querySelector("value");
            if (!value || !value.textContent) continue;

            result[camelCase(key.textContent)] = value.textContent
                .split(",")
                .map((v) => parseInt(v));
        }

        return result;
    }

    private decodeTask(kpi: ChildNode) {
        let result: DPStatsEntry = {};

        for (
            let entry = kpi.firstChild;
            entry !== null;
            entry = entry.nextSibling
        ) {
            if (entry.nodeType !== entry.ELEMENT_NODE) continue;

            result[camelCase((entry as Element).tagName)] = [
                parseInt((entry as Element).textContent),
            ];
        }

        return result;
    }
}
