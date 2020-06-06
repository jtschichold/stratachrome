export interface Config {
    notificationTimeout?: number;
    trackingInterval?: number;
    pollingDefault?: number;
    jobsTrackingInterval?: number;
    ifsTrackingInterval?: number;
    requestTimeout?: number;
    maxRunningReq?: number;
    filteredJobs?: string[];
    maxHistory?: number;
    highCpuThreshold?: number;
    highMemoryThreshold?: number;
}
