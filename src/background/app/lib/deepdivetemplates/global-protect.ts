import { DeepDiveTemplate } from "../../../../common/models";

const GlobalProtectOverview: DeepDiveTemplate = {
    id: "c5a12d2b-0647-4b96-842a-0cb729be55c5",
    version: 0,
    name: "GlobalProtect Overview",
    category: "General",
    description: "GlobalProtect Users over time",
    subtitle: "History of GlobalProtect Users",
    parameters: [],
    widgets: [
        {
            type: "history",
            title: "GlobalProtect Current Users",
            description: "Number of GlobalProtect Users over last 60 minutes",
            gridCellSize: 2,
            metric: "gp:root:gpgw:totalCurrentUsers",
        },
        {
            type: "history",
            title: "GlobalProtect Previous Users",
            description:
                "Number of GlobalProtect Previous Users over last 60 minutes",
            gridCellSize: 2,
            metric: "gp:root:gpgw:totalPreviousUsers",
        },
        {
            forEach: "device.vsysList",
            type: "history",
            title: "GlobalProtect Current Users on {{entry}}",
            description:
                "Number of GlobalProtect Users in {{entry}} over last 60 minutes",
            gridCellSize: 2,
            metric: "gp:{{entry}}:gpgw:totalCurrentUsers",
        },
        {
            forEach: "device.vsysList",
            type: "history",
            title: "GlobalProtect Previous Users in {{entry}}",
            description:
                "Number of GlobalProtect Previous Users in {{entry}} over last 60 minutes",
            gridCellSize: 2,
            metric: "gp:{{entry}}:gpgw:totalPreviousUsers",
        },
    ],
};

export default GlobalProtectOverview;
