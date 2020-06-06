export type DPStatsPeriodSpec = "week" | "day" | "hour" | "minute" | "second";

export interface DPPoint {
    [dpid: string]: DPStats;
}

export interface DPStats {
    [period: string]: DPStatsPeriod;
}

export interface DPStatsPeriod {
    cpuLoadAverage?: DPStatsEntry;
    cpuLoadMaximum?: DPStatsEntry;
    resourceUtilization?: DPStatsEntry;
    task?: DPStatsEntry;
}

export interface DPStatsEntry {
    [entry: string]: number[];
}

export interface MetricPoint {
    metrics: { [metricName: string]: number | bigint };
}

export interface InterfaceDelta {
    v: bigint; // value
    zf: boolean; // reminder
    u: boolean; // trend
}

export interface InterfaceHwPoint {
    ibytes: InterfaceDelta;
    obytes: InterfaceDelta;
    ipackets: InterfaceDelta;
    opackets: InterfaceDelta;
    ierrors: InterfaceDelta;
    idrops: InterfaceDelta;
}

export interface InterfacePoint {
    hwInterfaces: { [ifname: string]: InterfaceHwPoint };
    logicalInterfaces: { [ifname: string]: InterfaceLogicalPoint };
}

export interface InterfaceLogicalPoint {
    ibytes: InterfaceDelta;
    obytes: InterfaceDelta;
    ipackets: InterfaceDelta;
    opackets: InterfaceDelta;
    ierrors: InterfaceDelta;
    idrops: InterfaceDelta;
}

export interface MPPoint {
    us?: number;
    sy?: number;
    ni?: number;
    id?: number;
    wa?: number;
    hi?: number;
    si?: number;
    st?: number;
    memoryUsed?: number;
    memoryFree?: number;
    swapUsed?: number;
    swapFree?: number;
    loadAvg1Minute?: number;
    loadAvg5Minutes?: number;
    loadAvg15Minutes?: number;
}
