import { StatsDB, StatsDBValue } from "../../../../common/lib/statsdb";

import { MetricPoint, Metric } from "./model";
import { DbMetricHandler } from "./dbhandler";
import {
    MetricPoint as DbMetricPoint,
    Device,
} from "../../../../common/models";

import { CounterGlobalList } from "../counters";

type CountersMetricDBValue = DbMetricPoint & StatsDBValue;

// traffic metrics
// counters:<counter metric>

class CountersMetricsHandler extends DbMetricHandler<CountersMetricDBValue> {
    constructor(protected deviceSerial: string, protected statsdb: StatsDB) {
        super(deviceSerial, "counters", statsdb);
    }

    defineAccessor(metric: string) {
        let [check, ...cmetric] = metric.split(":");

        if (check !== "counters" || !cmetric || cmetric.length === 0)
            return null;

        return (p: CountersMetricDBValue, history: CountersMetricDBValue[]) => {
            return { v: p.metrics[cmetric.join(":")], t: p.date };
        };
    }
}

export const getCountersMetrics = (device: Device): Promise<Metric[]> => {
    let statsdb = new StatsDB(device.serial);
    return statsdb.open().then(() => {
        let result: Metric[] = [];
        let handler = new CountersMetricsHandler(device.serial, statsdb);

        return handler.init().then(() => {
            for (let cmetric of CounterGlobalList) {
                result.push({
                    name: `counters:${cmetric.category}:${cmetric.aspect}:${cmetric.severity}:${cmetric.name}:value`,
                    description: `Counters: ${cmetric.desc}`,
                    handler,
                    min: "auto",
                    unit: "tick",
                });
                result.push({
                    name: `counters:${cmetric.category}:${cmetric.aspect}:${cmetric.severity}:${cmetric.name}:rate`,
                    description: `Counters: ${cmetric.desc}`,
                    handler,
                    min: "auto",
                    unit: "tick",
                });
            }

            return result;
        });
    });
};
