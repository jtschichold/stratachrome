import { DeepDiveInstance } from "./deepdivetpl";

export interface DevicePreference {
    serial: string;
    deepdives?: DeepDiveInstance[];
    enabledOptionalPollers?: string[];
}
