import { DeepDiveTemplate } from "../../../../common/models";

const ActiveSessionsOverview: DeepDiveTemplate = {
    id: "fa405ac4-35a8-402f-84b6-8d591aa9f72e",
    version: 0,
    name: "Active Sessions Overview",
    category: "General",
    description: "Active sessions over time",
    subtitle: "History of active sessions",
    parameters: [],
    widgets: [
        {
            type: "history",
            title: "Total Active Sessions",
            description: "Number of Active Sessions over last 60 minutes",
            gridCellSize: 2,
            metric: "sessions:sessioninfo:numActive",
        },
        {
            type: "history",
            title: "TCP Sessions",
            description: "Number of Active TCP Sessions over last 60 minutes",
            gridCellSize: 1,
            metric: "sessions:sessioninfo:numTcp",
        },
        {
            type: "history",
            title: "UDP Sessions",
            description: "Number of Active UDP Sessions over last 60 minutes",
            gridCellSize: 1,
            metric: "sessions:sessioninfo:numUdp",
        },
        {
            type: "history",
            title: "ICMP Sessions",
            description: "Number of Active Icmp Sessions over last 60 minutes",
            gridCellSize: 1,
            metric: "sessions:sessioninfo:numIcmp",
        },
        {
            type: "history",
            title: "Multicast Sessions",
            description:
                "Number of Active Multicast Sessions over last 60 minutes",
            gridCellSize: 1,
            metric: "sessions:sessioninfo:numMcast",
        },
    ],
};

export default ActiveSessionsOverview;
