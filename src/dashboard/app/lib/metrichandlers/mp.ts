import { StatsDB, StatsDBValue } from "../../../../common/lib/statsdb";

import { MetricPoint, Metric } from "./model";
import { DbMetricHandler } from "./dbhandler";
import { MPPoint, Device } from "../../../../common/models";

type MPMetricDBValue = MPPoint & StatsDBValue;

// GP metrics
// mp:<attr>

const MPMetrics: Partial<Metric>[] = [
    {
        name: "mp:us",
        description: "MP: CPU User (%)",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:sy",
        description: "MP: CPU System (%)",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:ni",
        description: "MP: CPU Nice (%)",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:id",
        description: "MP: CPU Idle (%)",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:wa",
        description: "MP: CPU I/O Wait (%)",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:hi",
        description: "MP: CPU Hw Interrupt (%)",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:si",
        description: "MP: CPU SW Interrupt (%)",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:st",
        description: "MP: CPU Steal (%)",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:memoryUsed",
        description: "MP: Memory Used",
        min: 0,
        unit: "tick",
    },
    {
        name: "mp:memoryFree",
        description: "MP: Memory Free",
        min: 0,
        unit: "tick",
    },
    {
        name: "mp:memoryFreePct",
        description: "MP: Memory Free",
        min: 0,
        max: 100,
        unit: "pp",
    },
    { name: "mp:swapUsed", description: "MP: Swap Used", min: 0, unit: "tick" },
    { name: "mp:swapFree", description: "MP: Swap Free", min: 0, unit: "tick" },
    {
        name: "mp:swapFreePct",
        description: "MP: Swap Free",
        min: 0,
        max: 100,
        unit: "pp",
    },
    {
        name: "mp:loadAvg1Minute",
        description: "MP: 1 Minute Load Average",
        unit: "tick",
    },
    {
        name: "mp:loadAvg5Minutes",
        description: "MP: 5 Minutes Load Average",
        unit: "tick",
    },
    {
        name: "mp:loadAvg15Minutes",
        description: "MP: 15 Minutes Load Average",
        unit: "tick",
    },
];

class MPMetricsHandler extends DbMetricHandler<MPMetricDBValue> {
    constructor(protected deviceSerial: string, protected statsdb: StatsDB) {
        super(deviceSerial, "mp", statsdb);
    }

    defineAccessor(metric: string) {
        let [check, attr] = metric.split(":");

        if (check !== "mp") return null;

        if (attr === "swapFreePct") {
            return (p: MPMetricDBValue, history: MPMetricDBValue[]) => {
                return { v: p.swapUsed / (p.swapFree + p.swapUsed), t: p.date };
            };
        }

        if (attr === "memoryFreePct") {
            return (p: MPMetricDBValue, history: MPMetricDBValue[]) => {
                return {
                    v: p.memoryUsed / (p.memoryFree + p.memoryUsed),
                    t: p.date,
                };
            };
        }

        return (p: MPMetricDBValue, history: MPMetricDBValue[]) => {
            return { v: p[attr], t: p.date };
        };
    }
}

export const getMPMetrics = (device: Device): Promise<Metric[]> => {
    let statsdb = new StatsDB(device.serial);
    return statsdb.open().then(() => {
        let result: Metric[] = [];
        let handler = new MPMetricsHandler(device.serial, statsdb);

        return handler.init().then(() => {
            for (let smetric of MPMetrics) {
                result.push({
                    ...(smetric as any),
                    handler,
                });
            }

            return result;
        });
    });
};
