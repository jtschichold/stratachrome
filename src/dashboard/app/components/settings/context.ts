import * as React from "react";
import { Config } from "../../../../common/models";

export interface OptionalPollerChange {
    serial: string;
    id: string;
    state: "Enabled" | "Disabled";
}

export interface SettingsChanges {
    generalSettings: Config;
    deviceSettings: OptionalPollerChange[];
}

export interface SettingsChangesMethods {
    changeOptionalPoller: (change: OptionalPollerChange) => void;
    setConfigAttribute: (attr: string, value: any) => void;
    resetConfig: () => void;
    resetDevice: (serial: string) => void;
}

export const SettingsChangesContext = React.createContext<
    SettingsChanges & SettingsChangesMethods
>({
    generalSettings: {},
    deviceSettings: [],
    changeOptionalPoller: (change) => {},
    setConfigAttribute: (attr, value) => {},
    resetConfig: () => {},
    resetDevice: (serial) => {},
});
