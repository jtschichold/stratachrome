import { DeepDiveTemplate } from "../../../../common/models";

const IngressTraffic: DeepDiveTemplate = {
    id: "a822d342-3fea-4bcd-967c-72405833d152e",
    version: 0,
    name: "Ingress Traffic",
    category: "Traffic",
    subtitle: "Overview of ingress traffic",
    parameters: [],
    widgets: [
        {
            type: "history",
            title: "Ingress Traffic on Hardware Interfaces",
            description:
                "Ingress traffic on Hardware Interfaces over last 60 minutes",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:hw:*:ipackets",
        },
        {
            type: "history",
            title: "Ingress Traffic on Logical Interfaces",
            description:
                "Ingress traffic on Logical Interfaces over last 60 minutes",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:logical:*:ipackets",
        },
        {
            type: "history",
            title: "Traffic on DP",
            description: "Traffic on DP",
            gridCellSize: 2,
            binInterval: 30,
            metric: "sessions:sessioninfo:pps",
        },
    ],
};

export default IngressTraffic;
