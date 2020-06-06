import camelCase from "lodash/camelCase";

import { OpCmdMonitor } from "./model";
import { notifyDeviceUpdate } from "../../lib/devicenotifications";
import * as dbModels from "../../../../common/models";

const OP_SHOW_COUNTER_INTERFACE =
    "<show><counter><interface>all</interface></counter></show>";
const N1000 = BigInt(1000);
const N0 = BigInt(0);
const DUMMY_HW_INTERFACE_POINT: InterfaceHwPoint = {
    ibytes: N0,
    obytes: N0,
    ipackets: N0,
    opackets: N0,
    ierrors: N0,
    idrops: N0,
};
const DUMMY_LOGICAL_INTERFACE_POINT: InterfaceLogicalPoint = {
    ibytes: N0,
    obytes: N0,
    ipackets: N0,
    opackets: N0,
    ierrors: N0,
    idrops: N0,
};

interface InterfaceHwPoint {
    ibytes: bigint;
    obytes: bigint;
    ipackets: bigint;
    opackets: bigint;
    ierrors: bigint;
    idrops: bigint;
}

interface InterfacePoint {
    date: number;
    hwInterfaces: { [ifname: string]: InterfaceHwPoint };
    logicalInterfaces: { [ifname: string]: InterfaceLogicalPoint };
}

interface InterfaceLogicalPoint {
    ibytes: bigint;
    obytes: bigint;
    ipackets: bigint;
    opackets: bigint;
    ierrors: bigint;
    idrops: bigint;
}

export class IfsMonitor extends OpCmdMonitor {
    opCmd = OP_SHOW_COUNTER_INTERFACE;
    trackingInterval = 5;
    trackingIntervalKey = "ifsTrackingInterval";

    private logicalTags: string[] = [
        "ibytes",
        "obytes",
        "ipackets",
        "opackets",
        "ierrors",
        "idrops",
    ];
    private hardwareTags: string[] = [
        "ibytes",
        "obytes",
        "ipackets",
        "opackets",
        "ierrors",
        "idrops",
    ];

    private currentPoint: InterfacePoint = null;
    private currentDelta: InterfacePoint = null;

    handleResult(result: Element) {
        let self: IfsMonitor = this;
        let newPoint: InterfacePoint = {
            date: new Date().getTime(),
            logicalInterfaces: {},
            hwInterfaces: {},
        };
        let o2store = null;

        let ifNet = result.querySelector("ifnet");
        if (ifNet) {
            newPoint.logicalInterfaces = this.parseLogicalIfs(ifNet);
        }
        let hw = result.querySelector("hw");
        if (hw) {
            newPoint.hwInterfaces = this.parseHardwareIfs(hw);
        }

        if (this.currentPoint) {
            let deltat = newPoint.date - this.currentPoint.date;
            let newDelta: InterfacePoint = {
                date: deltat,
                hwInterfaces: this.computeHwDelta(
                    this.currentPoint.hwInterfaces,
                    newPoint.hwInterfaces
                ),
                logicalInterfaces: this.computeLogicalDelta(
                    this.currentPoint.logicalInterfaces,
                    newPoint.logicalInterfaces
                ),
            };

            o2store = this.computeDbInterfacePoint(newDelta, this.currentDelta);

            this.currentDelta = newDelta;
        }

        this.currentPoint = newPoint;

        if (!o2store) return Promise.resolve("OK");

        return this.statsdb
            .add("ifs", o2store)
            .then(() => {
                notifyDeviceUpdate(self.device.serial, "ifs");
            })
            .then(null, function (err) {
                console.log(
                    "Error saving dp for device " +
                        this.device.serial +
                        ": " +
                        err
                );

                throw err;
            });
    }

    private parseLogicalIfs(
        ifNet: Element
    ): InterfacePoint["logicalInterfaces"] {
        let result: InterfacePoint["logicalInterfaces"] = {};
        let bi0 = BigInt(0);

        let entries = ifNet.querySelectorAll("entry");
        for (let entry of entries) {
            if (entry.nodeType !== entry.ELEMENT_NODE) continue;

            let ifname: string = null;
            let stats: InterfaceLogicalPoint = {
                ibytes: bi0,
                obytes: bi0,
                ipackets: bi0,
                opackets: bi0,
                ierrors: bi0,
                idrops: bi0,
            };

            for (
                let eattribute = entry.firstChild;
                eattribute !== null;
                eattribute = eattribute.nextSibling
            ) {
                if (eattribute.nodeType !== eattribute.ELEMENT_NODE) continue;

                let tagName = (eattribute as Element).tagName;
                if (tagName === "name") {
                    ifname = eattribute.textContent;
                    continue;
                }
                if (this.logicalTags.indexOf(tagName) !== -1) {
                    stats[camelCase(tagName)] = BigInt(eattribute.textContent);
                }
            }

            if (ifname) result[ifname] = stats;
        }

        return result;
    }

    private parseHardwareIfs(hw: Element): InterfacePoint["hwInterfaces"] {
        let result: InterfacePoint["hwInterfaces"] = {};
        let bi0 = BigInt(0);

        let entries = hw.querySelectorAll("entry");
        for (let entry of entries) {
            if (entry.nodeType !== entry.ELEMENT_NODE) continue;

            let ifname: string = null;
            let stats: InterfaceHwPoint = {
                ibytes: bi0,
                obytes: bi0,
                ipackets: bi0,
                opackets: bi0,
                ierrors: bi0,
                idrops: bi0,
            };
            for (
                let eattribute = entry.firstChild;
                eattribute !== null;
                eattribute = eattribute.nextSibling
            ) {
                if (eattribute.nodeType !== eattribute.ELEMENT_NODE) continue;

                let tagName = (eattribute as Element).tagName;
                if (tagName === "interface") {
                    ifname = eattribute.textContent;
                    continue;
                }
                if (this.hardwareTags.indexOf(tagName) !== -1) {
                    stats[camelCase(tagName)] = BigInt(eattribute.textContent);
                }
            }

            if (ifname) result[ifname] = stats;
        }

        return result;
    }

    private computeHwDelta(
        old: InterfacePoint["hwInterfaces"],
        _new: InterfacePoint["hwInterfaces"]
    ): InterfacePoint["hwInterfaces"] {
        let result: InterfacePoint["hwInterfaces"] = {};

        Object.entries(_new).forEach(([ifname, ifstats]) => {
            let oldStats = old[ifname] || DUMMY_HW_INTERFACE_POINT;

            result[ifname] = {
                ibytes: ifstats.ibytes - oldStats.ibytes,
                obytes: ifstats.obytes - oldStats.obytes,
                ipackets: ifstats.ipackets - oldStats.ipackets,
                opackets: ifstats.opackets - oldStats.opackets,
                ierrors: ifstats.ierrors - oldStats.ierrors,
                idrops: ifstats.idrops - oldStats.idrops,
            };
        });

        return result;
    }

    private computeLogicalDelta(
        old: InterfacePoint["logicalInterfaces"],
        _new: InterfacePoint["logicalInterfaces"]
    ): InterfacePoint["logicalInterfaces"] {
        let result: InterfacePoint["logicalInterfaces"] = {};

        Object.entries(_new).forEach(([ifname, ifstats]) => {
            let oldStats = old[ifname] || DUMMY_LOGICAL_INTERFACE_POINT;

            result[ifname] = {
                ibytes: ifstats.ibytes - oldStats.ibytes,
                obytes: ifstats.obytes - oldStats.obytes,
                ipackets: ifstats.ipackets - oldStats.ipackets,
                opackets: ifstats.opackets - oldStats.opackets,
                ierrors: ifstats.ierrors - oldStats.ierrors,
                idrops: ifstats.idrops - oldStats.idrops,
            };
        });

        return result;
    }

    private computeDbInterfacePoint(
        newdelta: InterfacePoint,
        old: InterfacePoint
    ): dbModels.InterfacePoint {
        let result: dbModels.InterfacePoint = {
            hwInterfaces: {},
            logicalInterfaces: {},
        };
        let deltat = BigInt(newdelta.date);
        let oldDeltaT = old ? BigInt(old.date) : BigInt(1);
        let n0 = BigInt(0);

        Object.entries(newdelta.hwInterfaces).forEach(([ifname, ifpoint]) => {
            let oldHw: InterfaceHwPoint =
                (old && old.hwInterfaces[ifname]) || DUMMY_HW_INTERFACE_POINT;
            let ifHwPoint: Partial<dbModels.InterfaceHwPoint> = {};

            this.hardwareTags.forEach((tag) => {
                let t = ifpoint[tag] * N1000;
                let v = t / deltat;
                let zf = t == n0;
                let u = v > (oldHw[tag] * N1000) / oldDeltaT;

                ifHwPoint[tag] = { v, zf, u };
            });

            result.hwInterfaces[ifname] = ifHwPoint as any;
        });

        Object.entries(newdelta.logicalInterfaces).forEach(
            ([ifname, ifpoint]) => {
                let oldLogical: InterfaceLogicalPoint =
                    (old && old.logicalInterfaces[ifname]) ||
                    DUMMY_LOGICAL_INTERFACE_POINT;
                let ifLogicalPoint: Partial<dbModels.InterfaceLogicalPoint> = {};

                this.logicalTags.forEach((tag) => {
                    let t = ifpoint[tag] * N1000;
                    let v = t / deltat;
                    let zf = t == n0;
                    let u = v > (oldLogical[tag] * N1000) / oldDeltaT;

                    ifLogicalPoint[tag] = { v, zf, u };
                });

                result.logicalInterfaces[ifname] = ifLogicalPoint as any;
            }
        );

        return result;
    }
}
