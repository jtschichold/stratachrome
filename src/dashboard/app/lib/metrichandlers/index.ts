import { Device, OptionalPoller } from "../../../../common/models";
import { Metric } from "./model";
import { getInterfaceMetrics } from "./interfaces";
import { getSessionsMetrics } from "./sessions";
import { getCountersMetrics } from "./counters";
import { getGPMetrics } from "./gp";
import { getMPMetrics } from "./mp";

export { MetricPoint } from "./model";

export class MetricListManager {
    metrics: Metric[] = [];

    private device: Device;

    init(device: Device): Promise<any> {
        this.metrics = [];
        this.device = device;

        let promise = getInterfaceMetrics(this.device).then((metrics) => {
            this.metrics.push(...metrics);
        });
        promise = promise.then(() => {
            return getSessionsMetrics(this.device).then((metrics) => {
                this.metrics.push(...metrics);
            });
        });
        promise = promise.then(() => {
            return getCountersMetrics(this.device).then((metrics) => {
                this.metrics.push(...metrics);
            });
        });
        promise = promise.then(() => {
            return getMPMetrics(this.device).then((metrics) => {
                this.metrics.push(...metrics);
            });
        });

        promise = promise.then(() => {
            return getGPMetrics(this.device).then((metrics) => {
                this.metrics.push(...metrics);
            });
        });

        return promise;
    }

    cancel() {
        for (let m of this.metrics) {
            m.handler.cancel();
        }
    }
}
