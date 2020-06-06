import { Config } from "../models";

export class LocalStorageConfig implements Config {
    public notificationTimeout: number;
    public trackingInterval: number;
    public pollingDefault: number;
    public jobsTrackingInterval: number;
    public ifsTrackingInterval: number;
    public requestTimeout: number;
    public maxRunningReq: number;
    public filteredJobs: string[];
    public maxHistory: number;
    public highCpuThreshold: number;
    public highMemoryThreshold: number;

    private static defaultConfig: Config = {
        notificationTimeout: 5,
        trackingInterval: 30,
        pollingDefault: 1,
        jobsTrackingInterval: 30,
        ifsTrackingInterval: 5,
        requestTimeout: 5,
        maxRunningReq: 2,
        filteredJobs: [],
        maxHistory: 2,
        highCpuThreshold: 70,
        highMemoryThreshold: 75,
    };

    constructor() {
        this.load();
    }

    public load(): void {
        let ti = parseInt(localStorage.getItem("notificationTimeout"), 10);
        this.notificationTimeout = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.notificationTimeout
            : ti;

        ti = parseInt(localStorage.getItem("trackingInterval"), 10);
        this.trackingInterval = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.trackingInterval
            : ti;

        ti = parseInt(localStorage.getItem("pollingDefault"), 10);
        this.pollingDefault = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.pollingDefault
            : ti;

        ti = parseInt(localStorage.getItem("jobsTrackingInterval"), 10);
        this.jobsTrackingInterval = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.jobsTrackingInterval
            : ti;

        ti = parseInt(localStorage.getItem("ifsTrackingInterval"), 10);
        this.ifsTrackingInterval = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.ifsTrackingInterval
            : ti;

        ti = parseInt(localStorage.getItem("requestTimeout"), 10);
        this.requestTimeout = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.requestTimeout
            : ti;

        ti = parseInt(localStorage.getItem("maxRunningReq"), 10);
        this.maxRunningReq = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.maxRunningReq
            : ti;

        let tjobs = JSON.parse(localStorage.getItem("filteredJobs"));
        this.filteredJobs =
            tjobs || LocalStorageConfig.defaultConfig.filteredJobs;

        ti = parseInt(localStorage.getItem("maxHistory"), 2);
        this.maxHistory = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.maxHistory
            : ti;

        ti = parseInt(localStorage.getItem("highCpuThreshold"), 2);
        this.highCpuThreshold = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.highCpuThreshold
            : ti;

        ti = parseInt(localStorage.getItem("highMemoryThreshold"), 2);
        this.highMemoryThreshold = isNaN(ti)
            ? LocalStorageConfig.defaultConfig.highMemoryThreshold
            : ti;
    }

    static initDefault() {
        let defaultConfig = LocalStorageConfig.defaultConfig;
        LocalStorageConfig.setIfNull(
            "notificationTimeout",
            "" + defaultConfig.notificationTimeout
        );
        LocalStorageConfig.setIfNull(
            "trackingInterval",
            "" + defaultConfig.trackingInterval
        );
        LocalStorageConfig.setIfNull(
            "requestTimeout",
            "" + defaultConfig.requestTimeout
        );
        LocalStorageConfig.setIfNull(
            "maxRunningReq",
            "" + defaultConfig.maxRunningReq
        );
        LocalStorageConfig.setIfNull(
            "ifsTrackingInterval",
            "" + defaultConfig.ifsTrackingInterval
        );
        LocalStorageConfig.setIfNull(
            "jobsTrackingInterval",
            "" + defaultConfig.jobsTrackingInterval
        );
        LocalStorageConfig.setIfNull(
            "pollingDefault",
            "" + defaultConfig.pollingDefault
        );
        LocalStorageConfig.setIfNull(
            "filteredJobs",
            JSON.stringify(defaultConfig.filteredJobs)
        );
        LocalStorageConfig.setIfNull(
            "maxHistory",
            "" + defaultConfig.maxHistory
        );
        LocalStorageConfig.setIfNull(
            "highCpuThreshold",
            "" + defaultConfig.highCpuThreshold
        );
        LocalStorageConfig.setIfNull(
            "highMemoryThreshold",
            "" + defaultConfig.highMemoryThreshold
        );
    }

    static setIfNull(key: string, value: string) {
        if (localStorage.getItem(key) == null) {
            localStorage.setItem(key, value);
        }
    }

    static set(key: string, value: string) {
        localStorage.setItem(key, value);
    }
}
