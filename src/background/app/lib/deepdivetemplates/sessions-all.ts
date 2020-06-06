import { DeepDiveTemplate } from "../../../../common/models";

const SessionAllOverview: DeepDiveTemplate = {
    id: "abd1b151-4fb3-4a5c-8c9c-8c6593083c2e",
    version: 0,
    name: "Optional Sessions Details",
    category: "General",
    description: "Optional Sessions Metrics",
    subtitle: "History of session metrics",
    parameters: [],
    widgets: [
        {
            type: "history",
            title: "SSL Decrypt Sessions",
            description: "Number of SSL Decrypt Sessions over last 60 minutes",
            gridCellSize: 2,
            metric: "sessions:sessionall:ssl-decrypt",
        },
        {
            type: "history",
            title: "Discard Sessions",
            description:
                "Number of Active Sessions in Discard state over last 60 minutes",
            gridCellSize: 2,
            metric: "sessions:sessionall:discard",
        },
        {
            type: "history",
            title: "Long Running Sessions",
            description: "Number of Long Running Sessions over last 60 minutes",
            gridCellSize: 2,
            metric: "sessions:sessionall:long-running",
        },
        {
            type: "history",
            title: "High Volume Sessions",
            description: "Number of High Volume Sessions over last 60 minutes",
            gridCellSize: 2,
            metric: "sessions:sessionall:high-volume",
        },
    ],
};

export default SessionAllOverview;
