import { Device } from "../models";

export function cmp(d1: Device, d2: Device): boolean {
    return d1.serial === d2.serial;
}

export function toJSON(d: Device): string {
    let newDevice = { ...d };
    delete newDevice.apiKey;

    return JSON.stringify(newDevice);
}

export function fromJSON(s: string): Device {
    return JSON.parse(s);
}
