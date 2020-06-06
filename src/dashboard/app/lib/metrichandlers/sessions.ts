import { StatsDB, StatsDBValue } from "../../../../common/lib/statsdb";

import { MetricPoint, Metric } from "./model";
import { DbMetricHandler } from "./dbhandler";
import {
    MetricPoint as DbMetricPoint,
    Device,
} from "../../../../common/models";
// XXX this should be in common
import SessionAllMetrics from "../../../../background/app/lib/optionalpollers/sessionall";

const SessionInfoMetrics: Partial<Metric>[] = [
    {
        name: "sessions:sessioninfo:pps",
        description: "DP: Data Plane packets per second",
        min: 0,
        unit: "pps",
    },
    {
        name: "sessions:sessioninfo:numMax",
        description: "Sessions: Maximum number of sessions",
        min: 0,
        unit: "tick",
    },
    {
        name: "sessions:sessioninfo:numActive",
        description: "Sessions: Number of active sessions",
        min: 0,
        unit: "tick",
    },
    {
        name: "sessions:sessioninfo:numMcast",
        description: "Sessions: Number of active multicast sessions",
        min: 0,
        unit: "tick",
    },
    {
        name: "sessions:sessioninfo:numUdp",
        description: "Sessions: Number of active UDP sessions",
        min: 0,
        unit: "tick",
    },
    {
        name: "sessions:sessioninfo:numIcmp",
        description: "Sessions: Number of active ICMP sessions",
        min: 0,
        unit: "tick",
    },
    {
        name: "sessions:sessioninfo:numPredict",
        description: "Sessions: Number of predict sessions",
        min: 0,
        unit: "tick",
    },
    {
        name: "sessions:sessioninfo:numInstalled",
        description: "Sessions: Number of installed sessions",
        min: 0,
        unit: "tick",
    },
    {
        name: "sessions:sessioninfo:numTcp",
        description: "Sessions: Number of active TCP sessions",
        min: 0,
        unit: "tick",
    },
    {
        name: "sessions:sessioninfo:cps",
        description: "Sessions: Number of connections per second",
        min: 0,
        unit: "cps",
    },
    {
        name: "sessions:sessioninfo:kbps",
        description: "DP: Number of Kb per second",
        min: 0,
        unit: "kbps",
    },
];

type SessionsMetricDBValue = DbMetricPoint & StatsDBValue;

// traffic metrics
// sessions:sessioninfo:<something>

class SessionsMetricsHandler extends DbMetricHandler<SessionsMetricDBValue> {
    constructor(protected deviceSerial: string, protected statsdb: StatsDB) {
        super(deviceSerial, "sessions", statsdb);
    }

    defineAccessor(metric: string) {
        let [check, type_, attr] = metric.split(":");

        if (check !== "sessions" || !type_ || !attr) return null;

        if (type_ !== "sessioninfo" && type_ !== "sessionall") return null;

        return (p: SessionsMetricDBValue, history: SessionsMetricDBValue[]) => {
            let v = p.metrics[type_ + ":" + attr];
            if (typeof v === "undefined") return null;

            return { v: p.metrics[type_ + ":" + attr], t: p.date };
        };
    }
}

export const getSessionsMetrics = (device: Device): Promise<Metric[]> => {
    let statsdb = new StatsDB(device.serial);
    return statsdb.open().then(() => {
        let result: Metric[] = [];
        let handler = new SessionsMetricsHandler(device.serial, statsdb);

        return handler.init().then(() => {
            for (let smetric of SessionInfoMetrics) {
                result.push({
                    ...(smetric as any),
                    handler,
                });
            }

            for (let sametric of SessionAllMetrics) {
                result.push({
                    name: `sessions:sessionall:${sametric.metric}`,
                    description: sametric.description,
                    min: 0,
                    unit: "tick",
                    handler,
                });
            }

            return result;
        });
    });
};
