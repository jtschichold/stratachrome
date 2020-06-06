export function notifyDeviceUpdate(serial: string, utype: string) {
    chrome.runtime.sendMessage({
        cmd: "deviceupdate",
        serial,
        utype,
    });
}
