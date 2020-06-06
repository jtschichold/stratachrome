import camelCase from "lodash/camelCase";

import { OpCmdMonitor } from "./model";
import { MetricPoint } from "../../../../common/models";
import { notifyDeviceUpdate } from "../../lib/devicenotifications";

const OP_SHOW_COUNTER_GLOBAL =
    "<show><counter><global></global></counter></show>";

export class CounterGlobalMonitor extends OpCmdMonitor {
    opCmd = OP_SHOW_COUNTER_GLOBAL;

    handleResult(result: Element) {
        let self: CounterGlobalMonitor = this;
        let o2store: MetricPoint = {
            metrics: {},
        };

        let entries = result.querySelectorAll("entry");
        for (let entry of entries) {
            let t: any = {};
            for (
                let tag = entry.firstElementChild;
                tag != null;
                tag = tag.nextElementSibling
            ) {
                t[tag.tagName] = tag.textContent;
            }

            if (!t.name) continue;

            if (typeof t.value === "undefined") continue;
            o2store.metrics[
                `${t.category}:${t.aspect}:${t.severity}:${t.name}:value`
            ] = BigInt(t.value);

            if (typeof t.rate === "undefined") continue;
            o2store.metrics[
                `${t.category}:${t.aspect}:${t.severity}:${t.name}:rate`
            ] = BigInt(t.rate);
        }

        return this.statsdb
            .add("counters", o2store)
            .then(function (msg) {
                notifyDeviceUpdate(self.device.serial, "counters");
            })
            .then(null, function (err) {
                console.log(
                    "Error saving counters for device " +
                        this.device.serial +
                        ": " +
                        err
                );

                throw err;
            });
    }
}
