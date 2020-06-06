import {
    StatsDB,
    StatsDBValue,
    StatsDBOStore,
} from "../../../../common/lib/statsdb";
import { deviceNotificationsReceiver } from "../devicenotifications";

import { MetricHandler, MetricPoint, MetricCache } from "./model";

type DbMetricHandlerAccessor<T> = (p: T, history: T[]) => MetricPoint;

export abstract class DbMetricHandler<T extends StatsDBValue>
    implements MetricHandler {
    /* Last 60 minutes of entries */
    private last60Minutes: T[] = [];
    /* Cache with the last 60 minutes of requested caches */
    private cache: MetricCache<T> = {};
    /* device listener id */
    private listenerID: number = null;

    constructor(
        protected deviceSerial: string,
        protected ostore: StatsDBOStore,
        protected statsdb: StatsDB
    ) {}

    /**
     * Initalizes the instance
     * - read the last 60 minutes in the database into last60minutes
     * - refresh the cache
     * - add a listener to device changes to update the cache
     */
    init(): Promise<any> {
        return this.statsdb
            .eachLast60Minutes(this.ostore, (v: T) => {
                this.last60Minutes.push(v);
            })
            .then(() => {
                this.refreshMetricCache();

                this.listenerID = deviceNotificationsReceiver.addListener(
                    this.deviceSerial,
                    (utype) => {
                        if (utype !== this.ostore) return;

                        this.refreshMetricCache();
                    }
                );
            });
    }

    /**
     * Called on shutdown, removes the listener
     */
    cancel() {
        if (typeof this.listenerID === null) return;

        deviceNotificationsReceiver.removeListener(
            this.deviceSerial,
            this.listenerID
        );
        this.listenerID = null;
    }

    /**
     * Get the last value (MetricPoint) of a metric
     * If the metric is not known to the cache, the
     * cache is initialized
     * @param metric - name of the metric
     * @returns - a Promise with the MetricPoint
     */
    getLast(metric: string): Promise<MetricPoint> {
        if (this.cache[metric]) {
            let v = this.cache[metric].v;

            if (v.length === 0) return null;

            return Promise.resolve(v.slice(-1)[0]);
        }

        return this.getLast60Minutes(metric).then((points) => {
            if (points.length === 0) return null;

            return points.slice(-1)[0];
        });
    }

    /**
     * Returns the last 60 minutes of a metric.
     * If the metric is not in the cache, an accessor is retrieved
     * based on the metric and the cache is initialized
     * @param metric - name of the metric
     * @returns - Promise with the MetricPoint list
     */
    getLast60Minutes(metric: string): Promise<MetricPoint[]> {
        if (this.cache[metric]) {
            return Promise.resolve(this.cache[metric].v);
        }

        let accessor = this.defineAccessor(metric);
        if (!accessor) return Promise.reject("Unknown metric");

        let result = this.last60Minutes
            .map((p, _, history) => accessor(p, history))
            .filter(Boolean);

        this.cache[metric] = {
            v: result,
            a: accessor,
            subs: [],
        };

        return Promise.resolve(result);
    }

    /**
     * Subscribe to the metric changes
     * @param metric - name of the metric
     * @param cb - callback to be called when the metric changes
     * @returns - a function to be called for unsubscribing
     */
    subscribe(metric: string, cb: () => void): () => void {
        let cacheEntry = this.cache[metric];

        if (typeof cacheEntry === "undefined") return null;

        if (cacheEntry.subs.indexOf(cb) === -1) {
            cacheEntry.subs.push(cb);
        }

        return () => {
            this.cache[metric].subs = this.cache[metric].subs.filter(
                (s) => s !== cb
            );

            if (this.cache[metric].subs.length === 0) {
                delete this.cache[metric];
            }
        };
    }

    /**
     * Updates every metric in the cache
     */
    private refreshMetricCache() {
        // load latest data
        let oneHourAgo = new Date().getTime() - 3600 * 1000;
        let lastTimestamp =
            this.last60Minutes.length === 0
                ? oneHourAgo
                : this.last60Minutes.slice(-1)[0].date;
        let newElements: T[] = [];
        this.statsdb
            .forEachSince(this.ostore, lastTimestamp, (e: T) => {
                newElements.push(e);
            })
            .then(() => {
                this.last60Minutes = [
                    ...this.last60Minutes.filter((e) => e.date >= oneHourAgo),
                    ...newElements,
                ];

                // refresh cache
                Object.entries(this.cache).map(([_, entry]) => {
                    entry.v = entry.v.filter((v) => v.t >= oneHourAgo);
                    newElements.forEach((p) => {
                        let nv = entry.a(p, this.last60Minutes);
                        if (nv === null) return;

                        entry.v.push(nv);
                    });
                    setTimeout(() => {
                        entry.subs.forEach((s) => s());
                    }, 0);
                });
            });
    }

    /**
     * Implemented by subclasses
     * @param metric - name of the metric
     * @returns - a function to extract a MetricPoint from T. Should return null on errors
     */
    abstract defineAccessor(metric: string): DbMetricHandlerAccessor<T>;
}
