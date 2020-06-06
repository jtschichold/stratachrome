export interface DeviceLogicalInterface {
    name: string;
    zone?: string;
    vsys?: string;
}

export interface DeviceHwInterface {
    name: string;
    state: string;
    status?: string;
    speed?: string;
}

export interface Device {
    apiKey: string;
    url: string;
    viaPanorama: boolean;
    serial?: string;
    model?: string;
    deviceName?: string;
    swVersion?: string;
    vsysList?: string[];
    hwInterfaces: DeviceHwInterface[];
    logicalInterfaces: DeviceLogicalInterface[];
    disabled: boolean;

    isPolling: number;
    error: { [etype: string]: string };
}
