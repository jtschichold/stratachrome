import { DeepDiveTemplate } from "../../../../common/models";

const ZoneTraffic: DeepDiveTemplate = {
    id: "43b00105-a19f-4f89-8cd3-f72d8692de51",
    version: 0,
    name: "Zone Traffic",
    category: "Traffic",
    subtitle: "Details of traffic of zone {{zone}}",
    parameters: [{ name: "zone", type: "Zone" }],
    widgets: [
        {
            type: "history",
            title: "Ingress Traffic",
            description: "Incoming traffic in bits per second",
            gridCellSize: 2,
            targetUnit: "bps",
            binInterval: 30,
            metric: "ifs:logical:{{zone}}:ibytes",
        },
        {
            type: "history",
            title: "Egress Traffic",
            description: "Outgoing traffic in bits per second",
            gridCellSize: 2,
            targetUnit: "bps",
            binInterval: 30,
            metric: "ifs:logical:{{zone}}:obytes",
        },
        {
            type: "history",
            title: "Ingress Packets",
            description: "Incoming packets in pps",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:logical:{{zone}}:ipackets",
        },
        {
            type: "history",
            title: "Egress Packets",
            description: "Outgoing packets in pps",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:logical:{{zone}}:opackets",
        },
        {
            type: "history",
            title: "Drops",
            description: "Incoming packets dropped",
            gridCellSize: 1,
            binInterval: 30,
            metric: "ifs:logical:{{zone}}:idrops",
        },
        {
            type: "history",
            title: "Errors",
            description: "Errors processing input packets",
            gridCellSize: 1,
            binInterval: 30,
            metric: "ifs:logical:{{zone}}:ierrors",
        },
    ],
};

export default ZoneTraffic;
