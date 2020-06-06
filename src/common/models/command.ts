export type Command =
    | Add
    | GetMonitored
    | IsAlreadyMonitored
    | ReadConfig
    | DeviceListChanged
    | Delete
    | AddDevice
    | DeviceUpdate
    | DevicePoll
    | ReadMetadata;

interface Add {
    cmd: "add";
    user: string;
    password: string;
}

interface AddDevice {
    cmd: "adddevice";
    url: string;
    user?: string;
    password?: string;
    apiKey?: string;
}

interface Delete {
    cmd: "delete";
    serials: string[];
}

interface GetMonitored {
    cmd: "getmonitored";
}

interface IsAlreadyMonitored {
    cmd: "isalreadymonitored";
}

interface ReadConfig {
    cmd: "readconfig";
}

interface ReadMetadata {
    cmd: "readmetadata";
}

interface DeviceListChanged {
    cmd: "devicelistchanged";
}

interface DeviceUpdate {
    cmd: "deviceupdate";
    serial: string;
    utype: string;
}

interface DevicePoll {
    cmd: "poll";
    serial: string;
}
