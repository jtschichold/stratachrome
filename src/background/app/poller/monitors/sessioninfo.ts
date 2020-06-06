import camelCase from "lodash/camelCase";

import { OpCmdMonitor } from "./model";
import { MetricPoint } from "../../../../common/models";
import { notifyDeviceUpdate } from "../../lib/devicenotifications";

const OP_SHOW_SESSION_INFO = "<show><session><info></info></session></show>";
const TAGS_TO_MONITOR: string[] = [
    "pps",
    "num-max",
    "num-active",
    "num-mcast",
    "num-udp",
    "num-icmp",
    "num-predict",
    "num-bcast",
    "num-installed",
    "num-tcp",
    "cps",
    "kbps",
];

export class SessionInfoMonitor extends OpCmdMonitor {
    opCmd = OP_SHOW_SESSION_INFO;

    handleResult(result: Element) {
        let self: SessionInfoMonitor = this;
        let o2store: MetricPoint = {
            metrics: {},
        };

        for (
            let restag = result.firstChild;
            restag !== null;
            restag = restag.nextSibling
        ) {
            if (restag.nodeType !== restag.ELEMENT_NODE) continue;
            if (TAGS_TO_MONITOR.indexOf((restag as Element).tagName) === -1)
                continue;

            let t = (restag as Element).textContent;
            if (t) {
                o2store.metrics[
                    `sessioninfo:${camelCase((restag as Element).tagName)}`
                ] = BigInt(t);
            }
        }

        return this.statsdb
            .add("sessions", o2store)
            .then(function (msg) {
                notifyDeviceUpdate(self.device.serial, "sessions");
            })
            .then(null, function (err) {
                console.log(
                    "Error saving sessions for device " +
                        this.device.serial +
                        ": " +
                        err
                );

                throw err;
            });
    }
}
