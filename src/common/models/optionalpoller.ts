interface BaseOptionalPoller {
    id: string;
    type: string;
    description: string;
}

interface GPGWOptionalMetric extends BaseOptionalPoller {
    type: "gpgw";
}

export interface SessionAllOptionalMetric extends BaseOptionalPoller {
    type: "sessionall";
    metric: string;
    filter: { attr: string; value: string }[];
}

export type OptionalPoller = GPGWOptionalMetric | SessionAllOptionalMetric;
