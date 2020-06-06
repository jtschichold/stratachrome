import { DeepDiveTemplate } from "../../../../common/models";

const LogicalInterfaceTraffic: DeepDiveTemplate = {
    id: "6e2e003a-05d1-407b-8288-8ab7615d1a5f",
    version: 0,
    name: "Logical Interface Traffic",
    category: "Traffic",
    subtitle: "Details of traffic of logical interface for {{interface}}",
    parameters: [{ name: "interface", type: "LogicalInterface" }],
    widgets: [
        {
            type: "history",
            title: "Ingress Traffic",
            description: "Incoming traffic in bits per second",
            gridCellSize: 2,
            targetUnit: "bps",
            binInterval: 30,
            metric: "ifs:logical:{{interface}}:ibytes",
        },
        {
            type: "history",
            title: "Egress Traffic",
            description: "Outgoing traffic in bits per second",
            gridCellSize: 2,
            targetUnit: "bps",
            binInterval: 30,
            metric: "ifs:logical:{{interface}}:obytes",
        },
        {
            type: "history",
            title: "Ingress Packets",
            description: "Incoming packets in pps",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:logical:{{interface}}:ipackets",
        },
        {
            type: "history",
            title: "Egress Packets",
            description: "Outgoing packets in pps",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:logical:{{interface}}:opackets",
        },
        {
            type: "history",
            title: "Drops",
            description: "Incoming packets dropped",
            gridCellSize: 1,
            binInterval: 30,
            metric: "ifs:logical:{{interface}}:idrops",
        },
        {
            type: "history",
            title: "Errors",
            description: "Errors processing input packets",
            gridCellSize: 1,
            binInterval: 30,
            metric: "ifs:logical:{{interface}}:ierrors",
        },
    ],
};

export default LogicalInterfaceTraffic;
