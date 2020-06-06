import { SessionAllOptionalMetric } from "../../../../common/models";

const metrics: SessionAllOptionalMetric[] = [
    {
        id: "9bb00305-1448-478a-8af8-a634ab2c49a0",
        type: "sessionall",
        description: "SSL Decrypt Sessions",
        metric: "ssl-decrypt",
        filter: [
            {
                attr: "ssl-decrypt",
                value: "yes",
            },
        ],
    },
    {
        id: "84d3f9dc-e5b4-40c7-9b65-401ed2ba2132",
        type: "sessionall",
        description: "Sessions in Discard",
        metric: "discard",
        filter: [
            {
                attr: "state",
                value: "discard",
            },
        ],
    },
    {
        id: "95ca752f-2d5f-4e17-b143-c702a3262ddc",
        type: "sessionall",
        description: "Long running sessions (>2h)",
        metric: "long-running",
        filter: [
            {
                attr: "min-age",
                value: "7200",
            },
        ],
    },
    {
        id: "5d3cdb10-d317-4519-b7cd-733852c8324d",
        type: "sessionall",
        description: "High volume sessions (>1GB)",
        metric: "high-volume",
        filter: [
            {
                attr: "min-kb",
                value: "1048576",
            },
        ],
    },
];

export default metrics;
