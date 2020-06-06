export interface MetricPoint {
    t: number; // timestamp
    v: number | bigint; // value
}

export interface MetricHandler {
    getLast: (metricName: string) => Promise<MetricPoint>;
    getLast60Minutes: (metricName: string) => Promise<MetricPoint[]>;
    subscribe: (metricName: string, cb: () => void) => () => void;
    cancel: () => void;
}

export interface Metric {
    name: string;
    description: string;
    min?: number | bigint | "auto"; // default 0
    max?: number | bigint | "auto"; // default auto
    unit: "bps" | "pps" | "tick" | "pp" | "kbps" | "cps" | "Bps";
    handler: MetricHandler;
    optional?: boolean;
}

export interface MetricCache<T> {
    [metric: string]: {
        v: MetricPoint[];
        a: (p: T, history: T[]) => MetricPoint;
        subs: (() => void)[];
    };
}
