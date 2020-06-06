import { DeepDiveTemplate } from "../../../../common/models";

const VsysTraffic: DeepDiveTemplate = {
    id: "60101c6c-fc6b-4982-8a16-652a473d9642",
    version: 0,
    name: "Vsys Traffic",
    category: "Traffic",
    subtitle: "Details of traffic for {{vsys}}",
    parameters: [{ name: "vsys", type: "Vsys" }],
    widgets: [
        {
            type: "history",
            title: "Ingress Traffic",
            description: "Incoming traffic in bits per second",
            gridCellSize: 2,
            targetUnit: "bps",
            binInterval: 30,
            metric: "ifs:logical:{{vsys}}:ibytes",
        },
        {
            type: "history",
            title: "Egress Traffic",
            description: "Outgoing traffic in bits per second",
            gridCellSize: 2,
            targetUnit: "bps",
            binInterval: 30,
            metric: "ifs:logical:{{vsys}}:obytes",
        },
        {
            type: "history",
            title: "Ingress Packets",
            description: "Incoming packets in pps",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:logical:{{vsys}}:ipackets",
        },
        {
            type: "history",
            title: "Egress Packets",
            description: "Outgoing packets in pps",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:logical:{{vsys}}:opackets",
        },
        {
            type: "history",
            title: "Drops",
            description: "Incoming packets dropped",
            gridCellSize: 1,
            binInterval: 30,
            metric: "ifs:logical:{{vsys}}:idrops",
        },
        {
            type: "history",
            title: "Errors",
            description: "Errors processing input packets",
            gridCellSize: 1,
            binInterval: 30,
            metric: "ifs:logical:{{vsys}}:ierrors",
        },
    ],
};

export default VsysTraffic;
