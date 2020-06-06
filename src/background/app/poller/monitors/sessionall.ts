import { MultyOpCmdMonitor, MultiyOpCmdR } from "./model";
import {
    MetricPoint,
    SessionAllOptionalMetric,
} from "../../../../common/models";
import { notifyDeviceUpdate } from "../../lib/devicenotifications";

const OP_SHOW_SESSION_ALL =
    "<show><session><all><filter></filter></all></session></show>";

export class SessionAllMonitor extends MultyOpCmdMonitor {
    opCmds: { metric: string; opCmd: string }[] = [];

    updateMetrics(
        metrics: Pick<SessionAllOptionalMetric, "metric" | "filter">[]
    ) {
        this.opCmds = metrics.map((m) => {
            let opCmd =
                "<show><session><all><filter>" +
                m.filter
                    .map((f) => `<${f.attr}>${f.value}</${f.attr}>`)
                    .join("") +
                "<count>yes</count></filter></all></session></show>";

            return {
                metric: m.metric,
                opCmd,
            };
        });
    }

    handleResult(reselements: MultiyOpCmdR[]) {
        let self: SessionAllMonitor = this;
        let o2store: MetricPoint = {
            metrics: {},
        };

        for (let reselement of reselements) {
            let count = reselement.apiRequestResult.querySelector("member");
            if (count && count.textContent) {
                o2store.metrics[`sessionall:${reselement.metric}`] = BigInt(
                    count.textContent
                );
            }
        }

        return this.statsdb
            .add("sessions", o2store)
            .then(function (msg) {
                notifyDeviceUpdate(self.device.serial, "sessions");
            })
            .then(null, function (err) {
                console.log(
                    "Error saving session all for device " +
                        this.device.serial +
                        ": " +
                        err
                );

                throw err;
            });
    }
}
