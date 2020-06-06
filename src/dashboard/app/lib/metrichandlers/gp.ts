import { StatsDB, StatsDBValue } from "../../../../common/lib/statsdb";

import { MetricPoint, Metric } from "./model";
import { DbMetricHandler } from "./dbhandler";
import {
    MetricPoint as DbMetricPoint,
    Device,
} from "../../../../common/models";

type GPMetricDBValue = DbMetricPoint & StatsDBValue;

// GP metrics
// gp:<vsys>:gpgw:totalPreviousUsers
// gp:<vsys>:gpgw:totalCurrentUsers

class GPMetricsHandler extends DbMetricHandler<GPMetricDBValue> {
    constructor(protected deviceSerial: string, protected statsdb: StatsDB) {
        super(deviceSerial, "gp", statsdb);
    }

    defineAccessor(metric: string) {
        let [check, ...cmetric] = metric.split(":");

        if (check !== "gp" || !cmetric || cmetric.length === 0) return null;

        return (p: GPMetricDBValue, history: GPMetricDBValue[]) => {
            return { v: p.metrics[cmetric.join(":")], t: p.date };
        };
    }
}

export const getGPMetrics = (device: Device): Promise<Metric[]> => {
    let statsdb = new StatsDB(device.serial);
    return statsdb.open().then(() => {
        let result: Metric[] = [];
        let handler = new GPMetricsHandler(device.serial, statsdb);

        return handler.init().then(() => {
            result.push({
                name: "gp:root:gpgw:totalPreviousUsers",
                description: "GlobalProtect: system total previous users",
                unit: "tick",
                handler,
                optional: true,
            });
            result.push({
                name: "gp:root:gpgw:totalCurrentUsers",
                description: "GlobalProtect: system total current users",
                unit: "tick",
                handler,
                optional: true,
            });
            for (let vsys of device.vsysList) {
                result.push({
                    name: `gp:${vsys}:gpgw:totalPreviousUsers`,
                    description: `GlobalProtect: ${vsys} total previous users`,
                    unit: "tick",
                    handler,
                    optional: true,
                });
                result.push({
                    name: `gp:${vsys}:gpgw:totalCurrentUsers`,
                    description: `GlobalProtect: ${vsys} total current users`,
                    unit: "tick",
                    handler,
                    optional: true,
                });
            }

            return result;
        });
    });
};
