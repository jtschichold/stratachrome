import { DeepDiveTemplate } from "../../../../common/models";

const HardwareInterfaceTraffic: DeepDiveTemplate = {
    id: "5545028b-fb9f-450a-a8e2-1794059bb607",
    version: 0,
    name: "Hardware Interface Traffic",
    category: "Traffic",
    subtitle: "Details of traffic of hardware interface {{interface}}",
    parameters: [{ name: "interface", type: "HardwareInterface" }],
    widgets: [
        {
            type: "history",
            title: "Ingress Traffic",
            description: "Incoming traffic in bits per second",
            gridCellSize: 2,
            targetUnit: "bps",
            binInterval: 30,
            metric: "ifs:hw:{{interface}}:ibytes",
        },
        {
            type: "history",
            title: "Egress Traffic",
            description: "Outgoing traffic in bits per second",
            gridCellSize: 2,
            targetUnit: "bps",
            binInterval: 30,
            metric: "ifs:hw:{{interface}}:obytes",
        },
        {
            type: "history",
            title: "Ingress Packets",
            description: "Incoming packets in pps",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:hw:{{interface}}:ipackets",
        },
        {
            type: "history",
            title: "Egress Packets",
            description: "Outgoing packets in pps",
            gridCellSize: 2,
            binInterval: 30,
            metric: "ifs:hw:{{interface}}:opackets",
        },
        {
            type: "history",
            title: "Drops",
            description: "Incoming packets dropped",
            gridCellSize: 1,
            binInterval: 30,
            metric: "ifs:hw:{{interface}}:idrops",
        },
        {
            type: "history",
            title: "Errors",
            description: "Errors processing input packets",
            gridCellSize: 1,
            binInterval: 30,
            metric: "ifs:hw:{{interface}}:ierrors",
        },
    ],
};

export default HardwareInterfaceTraffic;
