import { VsysOpCmdMonitor, VsysElementR } from "./model";
import { MetricPoint } from "../../../../common/models";
import { notifyDeviceUpdate } from "../../lib/devicenotifications";

const OP_SHOW_GPGW_STATS =
    "<show><global-protect-gateway><statistics></statistics></global-protect-gateway></show>";

export class GPGWMonitor extends VsysOpCmdMonitor {
    opCmd = OP_SHOW_GPGW_STATS;

    handleResult(reselements: VsysElementR[]) {
        let self: GPGWMonitor = this;
        let o2store: MetricPoint = {
            metrics: {},
        };

        for (let reselement of reselements) {
            let totalCurrentUsers = reselement.apiRequestResult.querySelector(
                "TotalCurrentUsers"
            );
            if (totalCurrentUsers && totalCurrentUsers.textContent) {
                o2store.metrics[
                    `${reselement.vsys}:gpgw:totalCurrentUsers`
                ] = parseInt(totalCurrentUsers.textContent);
            }
            let totalPreviousUsers = reselement.apiRequestResult.querySelector(
                "TotalPreviousUsers"
            );
            if (totalPreviousUsers && totalPreviousUsers.textContent) {
                o2store.metrics[
                    `${reselement.vsys}:gpgw:totalPreviousUsers`
                ] = parseInt(totalPreviousUsers.textContent);
            }
        }

        return this.statsdb
            .add("gp", o2store)
            .then(function (msg) {
                notifyDeviceUpdate(self.device.serial, "gpgw");
            })
            .then(null, function (err) {
                console.log(
                    "Error saving gpgw for device " +
                        self.device.serial +
                        ": " +
                        err
                );

                throw err;
            });
    }
}
