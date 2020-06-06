import { DeepDiveTemplate } from "../../../../common/models";

const CounterGlobalHistory: DeepDiveTemplate = {
    id: "246b3d84-935c-4197-95c3-6c23995414b3",
    version: 0,
    name: "Counter Global History",
    category: "Counters",
    subtitle: "History of {{counter}}",
    parameters: [{ name: "counter", type: "Counter" }],
    widgets: [
        {
            forEach: "metrics[?contains(@, join(`:`,[``,$.counter,`value`]))]",
            type: "history",
            title: "{{counter}} Value",
            description: "Counter value over last 60 minutes",
            gridCellSize: 2,
            metric: "{{entry}}",
        },
        {
            forEach: "metrics[?contains(@, join(`:`,[``,$.counter,`rate`]))]",
            type: "history",
            title: "{{counter}} Rate",
            description: "Counter rate over last 60 minutes",
            gridCellSize: 2,
            metric: "{{entry}}",
        },
    ],
};

export default CounterGlobalHistory;
