import { StatsDB, StatsDBValue } from "../../../../common/lib/statsdb";

import { MetricPoint, Metric } from "./model";
import { DbMetricHandler } from "./dbhandler";
import { InterfacePoint, Device } from "../../../../common/models";

const LogicalTags: string[] = [
    "ibytes",
    "obytes",
    "ipackets",
    "opackets",
    "ierrors",
    "idrops",
];
const HardwareTags: string[] = [
    "ibytes",
    "obytes",
    "ipackets",
    "opackets",
    "ierrors",
    "idrops",
];

type InterfaceMetricDBValue = InterfacePoint & StatsDBValue;

// traffic metrics
// ifs:hw:<ifname>:<something>
// ifs:hw:*:<something> => sum of <something> over all the hw interfaces
// ifs:logical:<ifname>:<something>
// ifs:logical:*:<something> => sum of <something> over all the logical interfaces
// ifs:logical:<zonename>:<something> => sum of <something> over all the logical interfaces of <zonename>
// ifs:logical:<vsysname>:<something> => sum of <something> over all the logical interfaces of <vsys>

class InterfaceMetricsHandler extends DbMetricHandler<InterfaceMetricDBValue> {
    constructor(
        protected deviceSerial: string,
        protected statsdb: StatsDB,
        private vsyses: { [vsys: string]: string[] },
        private zones: { [zone: string]: string[] }
    ) {
        super(deviceSerial, "ifs", statsdb);
    }

    defineAccessor(metric: string) {
        let [check, type_, ...ifname_and_attr] = metric.split(":");
        let attr = ifname_and_attr.pop();
        let ifname = ifname_and_attr.join(":");

        if (check !== "ifs" || !type_ || !attr || !ifname) return null;

        if (type_ == "hw") {
            if (ifname !== "*") {
                // single interface accessor
                return (
                    p: InterfaceMetricDBValue,
                    history: InterfaceMetricDBValue[]
                ): MetricPoint => {
                    return { t: p.date, v: p.hwInterfaces[ifname][attr].v };
                };
            }

            // sum accessor
            return (
                p: InterfaceMetricDBValue,
                history: InterfaceMetricDBValue[]
            ): MetricPoint => {
                // it's ifs.hw.*.<something> sum over all the hw interfaces
                let v: bigint = 0n;
                Object.entries(p.hwInterfaces).forEach(([_, hwPoint]) => {
                    v += hwPoint[attr].v;
                });

                return { t: p.date, v };
            };
        }

        // logical
        if (ifname === "*") {
            // sum accessor
            return (
                p: InterfaceMetricDBValue,
                history: InterfaceMetricDBValue[]
            ): MetricPoint => {
                // it's ifs.hw.*.<something> sum over all the hw interfaces
                let v: bigint = 0n;
                Object.entries(p.logicalInterfaces).forEach(
                    ([_, logicalPoint]) => {
                        v += logicalPoint[attr].v;
                    }
                );

                return { t: p.date, v };
            };
        }
        return (
            p: InterfaceMetricDBValue,
            history: InterfaceMetricDBValue[]
        ): MetricPoint => {
            if (typeof p.logicalInterfaces[ifname] !== "undefined") {
                return { t: p.date, v: p.logicalInterfaces[ifname][attr].v };
            }

            let interfaceList = this.vsyses[ifname] || this.zones[ifname] || [];

            let v: bigint = 0n;
            for (let cifName of interfaceList) {
                if (
                    !p.logicalInterfaces[cifName] ||
                    !p.logicalInterfaces[cifName][attr]
                ) {
                    continue;
                }

                v += p.logicalInterfaces[cifName][attr].v || 0n;
            }

            return { t: p.date, v };
        };
    }
}

export const getInterfaceMetrics = (device: Device): Promise<Metric[]> => {
    let zones: { [zone: string]: string[] } = {};
    let vsyses: { [vsys: string]: string[] } = {};

    device.logicalInterfaces.forEach((logicalIf) => {
        let { zone, vsys, name } = logicalIf;

        if (zone) {
            if (!zones[zone]) {
                zones[zone] = [name];
            } else {
                zones[zone].push(name);
            }
        }

        if (vsys) {
            let vsysName = `vsys${vsys}`;
            if (!vsyses[vsysName]) {
                vsyses[vsysName] = [name];
            } else {
                vsyses[vsysName].push(name);
            }
        }
    });

    let statsdb = new StatsDB(device.serial);
    return statsdb.open().then(() => {
        let handler = new InterfaceMetricsHandler(
            device.serial,
            statsdb,
            vsyses,
            zones
        );
        return handler.init().then(() => {
            let result: Metric[] = [];

            for (let cif of device.hwInterfaces) {
                for (let tag of HardwareTags) {
                    result.push({
                        name: `ifs:hw:${cif.name}:${tag}`,
                        description: `Interface: ${tag} on hardware interface ${cif.name}`,
                        handler,
                        unit:
                            tag === "ibytes" || tag === "obytes"
                                ? "Bps"
                                : "pps",
                    });
                }
            }
            for (let tag of HardwareTags) {
                result.push({
                    name: `ifs:hw:*:${tag}`,
                    description: `Interface: aggregated ${tag} on all hardware interfaces`,
                    handler,
                    unit: tag === "ibytes" || tag === "obytes" ? "Bps" : "pps",
                });
            }

            for (let cif of device.logicalInterfaces) {
                for (let tag of LogicalTags) {
                    result.push({
                        name: `ifs:logical:${cif.name}:${tag}`,
                        description: `Interface: ${tag} on logical interface ${cif.name}`,
                        handler,
                        unit:
                            tag === "ibytes" || tag === "obytes"
                                ? "Bps"
                                : "pps",
                    });
                }
            }
            Object.keys(zones).forEach((czone) => {
                for (let tag of LogicalTags) {
                    result.push({
                        name: `ifs:logical:${czone}:${tag}`,
                        description: `Interface: aggregated ${tag} on zone ${czone}`,
                        handler,
                        unit:
                            tag === "ibytes" || tag === "obytes"
                                ? "Bps"
                                : "pps",
                    });
                }
            });
            Object.keys(vsyses).forEach((cvsys) => {
                for (let tag of LogicalTags) {
                    result.push({
                        name: `ifs:logical:${cvsys}:${tag}`,
                        description: `Interface: aggregated ${tag} on vsys ${cvsys}`,
                        handler,
                        unit:
                            tag === "ibytes" || tag === "obytes"
                                ? "Bps"
                                : "pps",
                    });
                }
            });
            for (let tag of LogicalTags) {
                result.push({
                    name: `ifs:logical:*:${tag}`,
                    description: `Interface: aggregated ${tag} on all hardware interfaces`,
                    handler,
                    unit: tag === "ibytes" || tag === "obytes" ? "Bps" : "pps",
                });
            }

            return result;
        });
    });
};
